import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGlassesStore } from '@/store/glassesStore';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function GlassScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const isLandscape = screenData.width > screenData.height;

  // Glasses store
  const { glasses, isLoading, error, fetchGlasses, editGlassPrice } = useGlassesStore();

  // Modal state for editing price
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedGlass, setSelectedGlass] = useState<{id: number, name: string, price: string} | null>(null);
  const [newPrice, setNewPrice] = useState('');

  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const inputBackgroundColor = useThemeColor({ light: '#fafafa', dark: '#2a2a2a' }, 'background');
  const inputBorderColor = useThemeColor({ light: '#d0d0d0', dark: '#555' }, 'text');

  // Fetch glasses on mount
  useEffect(() => {
    fetchGlasses();
  }, [fetchGlasses]);

  // Update screen dimensions on orientation change
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchGlasses();
    } finally {
      setRefreshing(false);
    }
  };

  // Open edit modal
  const handleEditPrice = (glass: {id: number, name: string, price: string}) => {
    setSelectedGlass(glass);
    setNewPrice(glass.price);
    setEditModalVisible(true);
  };

  // Confirm edit
  const confirmEditPrice = async () => {
    if (!selectedGlass) return;
    if (!newPrice.trim()) {
      Alert.alert('Error', 'Ingrese un precio válido');
      return;
    }
    try {
      await editGlassPrice(selectedGlass.id, newPrice);
      setEditModalVisible(false);
      setSelectedGlass(null);
      setNewPrice('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el precio');
    }
  };

  // Cancel edit
  const cancelEditPrice = () => {
    setEditModalVisible(false);
    setSelectedGlass(null);
    setNewPrice('');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']} // Android
            tintColor="#2196F3" // iOS
          />
        }
      >
        {/* Header */}
        <ThemedView style={[styles.header, isLandscape && styles.headerLandscape]}>
          <IconSymbol
            size={isLandscape ? 40 : 60}
            color="#2196F3"
            name="calendar"
            style={styles.headerIcon}
          />
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={[styles.titleText, isLandscape && styles.titleTextLandscape]}>Catálogo de Vidrios</ThemedText>
          </View>
        </ThemedView>
      
      <ThemedView style={[styles.tableContainer, isLandscape && styles.tableContainerLandscape]}>
        {/* Table Header */}
        <ThemedView style={styles.tableHeader}>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={[styles.headerText, isLandscape && styles.headerTextLandscape]}>Nombre</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={[styles.headerText, isLandscape && styles.headerTextLandscape]}>Precio</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeaderActions}>
            <ThemedText type="defaultSemiBold" style={[styles.headerText, isLandscape && styles.headerTextLandscape]}>Acciones</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Table Rows */}
        <ScrollView style={styles.tableBody}>
          {isLoading ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Cargando vidrios...</ThemedText>
            </ThemedView>
          ) : error ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Error: {error}</ThemedText>
            </ThemedView>
          ) : glasses.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No hay productos disponibles</ThemedText>
            </ThemedView>
          ) : (
            glasses.map((item) => (
              <ThemedView key={item.id} style={[styles.tableRow, isLandscape && styles.tableRowLandscape]}>
                <ThemedView style={styles.column}>
                  <ThemedText style={[styles.cellText, isLandscape && styles.cellTextLandscape]}>
                    {item.name}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.column}>
                  <ThemedText style={[styles.cellText, isLandscape && styles.cellTextLandscape]}>{item.price}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.columnActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditPrice(item)}
                  >
                    <IconSymbol name="pencil" size={22} color="#2196F3" />
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            ))
          )}
        </ScrollView>
      </ThemedView>
      {/* Edit Price Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={cancelEditPrice}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.formModalContainer, isLandscape && styles.formModalContainerLandscape]}>
            <ThemedView style={styles.modalHeader}>
              <IconSymbol size={40} name="dollarsign.circle.fill" color="#2196F3" />
              <ThemedText type="subtitle" style={styles.modalTitle}>Editar precio</ThemedText>
            </ThemedView>
            <ThemedView style={styles.modalBody}>
              <ThemedText style={styles.modalText}>
                {selectedGlass?.name}
              </ThemedText>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Nuevo precio *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, color: textColor }]}
                  value={newPrice}
                  onChangeText={setNewPrice}
                  placeholder="Ingrese el nuevo precio"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </ThemedView>

              <ThemedText style={styles.requiredNote}>* Campo obligatorio</ThemedText>
            </ThemedView>
            <ThemedView style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#d0d0d0' }]}
                onPress={cancelEditPrice}
              >
                <ThemedText style={{ color: '#333', fontWeight: '600' }}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#2196f3', borderWidth: 1, borderColor: '#1976d2' }]}
                onPress={confirmEditPrice}
              >
                <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Guardar</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </View>
      </Modal>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLandscape: {
    padding: 10,
    marginBottom: 5,
  },
  headerIcon: {
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  titleText: {
    fontWeight: 'bold',
  },
  titleTextLandscape: {
    fontSize: 20,
  },
  tableContainer: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 16,
  },
  tableContainerLandscape: {
    marginHorizontal: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 8,
  },
  columnHeader: {
    flex: 1,
    paddingHorizontal: 4,
  },
  columnHeaderActions: {
    width: 120,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  headerTextLandscape: {
    fontSize: 16,
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 60,
  },
  tableRowLandscape: {
    paddingVertical: 8,
    minHeight: 50,
  },
  column: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  columnActions: {
    width: 120,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  cellTextLandscape: {
    fontSize: 14,
    lineHeight: 18,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 350,
    maxWidth: 500,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalContainerLandscape: {
    margin: 10,
    padding: 16,
    minWidth: 400,
    maxWidth: 600,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtext: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666666',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Form Modal styles
  formModalContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 400,
    maxWidth: 600,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formModalContainerLandscape: {
    margin: 10,
    padding: 16,
    minWidth: 500,
    maxWidth: 700,
    maxHeight: '90%',
  },
  formContainer: {
    maxHeight: 500,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  requiredNote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  buttonIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Loading, error, and empty states
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
