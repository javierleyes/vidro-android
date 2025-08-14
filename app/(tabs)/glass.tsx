import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function GlassScreen() {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedGlass, setSelectedGlass] = useState<{id: number, name: string} | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Screen dimensions for responsive design
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  const isLandscape = screenData.width > screenData.height;
  
  // Update screen dimensions on orientation change
  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
    };
    
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);
  
  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const inputBackgroundColor = useThemeColor({ light: '#fafafa', dark: '#2a2a2a' }, 'background');
  const inputBorderColor = useThemeColor({ light: '#d0d0d0', dark: '#555' }, 'text');
  
  // Sample glass data
  const [glassItems, setGlassItems] = useState([
    { id: 1, name: 'Vidrio Templado', price: '$150.00' },
    { id: 2, name: 'Vidrio Laminado', price: '$200.00' },
    { id: 3, name: 'Vidrio Flotado', price: '$100.00' },
    { id: 4, name: 'Vidrio Espejo', price: '$180.00' },
    { id: 5, name: 'Vidrio Decorativo', price: '$250.00' },
  ]);
  
  // Form state for adding new glass item
  const [formData, setFormData] = useState({
    name: '',
    price: ''
  });

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteGlass = (glassId: number, glassName: string) => {
    setSelectedGlass({ id: glassId, name: glassName });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (selectedGlass) {
      try {
        setGlassItems(glassItems.filter(item => item.id !== selectedGlass.id));
        setDeleteModalVisible(false);
        setSelectedGlass(null);
      } catch (error) {
        console.error('Failed to delete glass item:', error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setSelectedGlass(null);
  };

  const handleAddGlass = () => {
    setAddModalVisible(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Por favor ingrese un nombre');
      return false;
    }
    if (!formData.price.trim()) {
      Alert.alert('Error', 'Por favor ingrese un precio');
      return false;
    }
    
    return true;
  };

  const confirmAddGlass = async () => {
    if (!validateForm()) return;
    
    const newGlass = {
      id: Math.max(...glassItems.map(item => item.id), 0) + 1,
      name: formData.name,
      price: formData.price.startsWith('$') ? formData.price : `$${formData.price}`
    };
    
    try {
      setGlassItems([...glassItems, newGlass]);
      setAddModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Failed to add glass item:', error);
    }
  };

  const cancelAddGlass = () => {
    setAddModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: ''
    });
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
          {glassItems.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No hay productos disponibles</ThemedText>
            </ThemedView>
          ) : (
            glassItems.map((item) => (
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
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteGlass(item.id, item.name)}
                  >
                    <ThemedText style={styles.buttonIcon}>❌</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            ))
          )}
        </ScrollView>
        
        {/* Add New Glass Button */}
        <ThemedView style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddGlass}
          >
            <ThemedText style={styles.addButtonIcon}>➕</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContainer, isLandscape && styles.modalContainerLandscape]}>
            <ThemedView style={styles.modalHeader}>
              <IconSymbol size={40} name="exclamationmark.triangle" color="#F44336" />
              <ThemedText type="subtitle" style={styles.modalTitle}>Eliminar producto</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.modalBody}>
              <ThemedText style={styles.modalText}>
                ¿Eliminar el producto {selectedGlass?.name}?
              </ThemedText>
              <ThemedText style={styles.modalSubtext}>
                Esta acción no se puede deshacer.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmDeleteButton]}
                onPress={confirmDelete}
              >
                <ThemedText style={styles.deleteButtonText}>Eliminar</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </View>
      </Modal>

      {/* Add New Glass Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={cancelAddGlass}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.formModalContainer, isLandscape && styles.formModalContainerLandscape]}>
            <ThemedView style={styles.modalHeader}>
              <IconSymbol size={40} name="plus.circle" color="#2196F3" />
              <ThemedText type="subtitle" style={styles.modalTitle}>Agregar producto</ThemedText>
            </ThemedView>
            
            <ScrollView style={styles.formContainer}>
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Nombre *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, color: textColor }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Ingrese el nombre del producto"
                  placeholderTextColor="#999"
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Precio *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, color: textColor }]}
                  value={formData.price}
                  onChangeText={(text) => setFormData({...formData, price: text})}
                  placeholder="150.00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </ThemedView>

              <ThemedText style={styles.requiredNote}>* Campos obligatorios</ThemedText>
            </ScrollView>

            <ThemedView style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelAddGlass}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmAddButton]}
                onPress={confirmAddGlass}
              >
                <ThemedText style={styles.addButtonTextModal}>Listo</ThemedText>
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
  deleteButton: {
    backgroundColor: 'transparent',
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
  addButtonContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    width: 40,
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
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  confirmDeleteButton: {
    backgroundColor: '#f44336',
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  confirmAddButton: {
    backgroundColor: '#2196f3',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  addButtonTextModal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButtonIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
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
