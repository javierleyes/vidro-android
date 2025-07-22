import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { VisitStatus } from '@/constants/Status';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useVisitsStore } from '@/store/visitsStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function VisitsScreen() {
  const { visits, isLoading, error, deleteVisit, completeVisit, addVisit, fetchVisits } = useVisitsStore();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<{id: number, name: string} | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Theme colors
  const textColor = useThemeColor({}, 'text');
  const inputBackgroundColor = useThemeColor({ light: '#fafafa', dark: '#2a2a2a' }, 'background');
  const inputBorderColor = useThemeColor({ light: '#d0d0d0', dark: '#555' }, 'text');
  
  // Fetch visits when component mounts
  useEffect(() => {
    fetchVisits(VisitStatus.PENDING);
  }, [fetchVisits]);
  
  // Form state for adding new visit
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    address: '',
    phone: ''
  });
  
  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchVisits(VisitStatus.PENDING);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCompleteVisit = (visitId: number, visitorName: string) => {
    setSelectedVisit({ id: visitId, name: visitorName });
    setCompleteModalVisible(true);
  };

  const handleDeleteVisit = (visitId: number, visitorName: string) => {
    setSelectedVisit({ id: visitId, name: visitorName });
    setDeleteModalVisible(true);
  };

  const confirmComplete = async () => {
    if (selectedVisit) {
      try {
        await completeVisit(selectedVisit.id);
        setCompleteModalVisible(false);
        setSelectedVisit(null);
      } catch (error) {
        // Error is already handled in the store, but you could add additional UI feedback here
        console.error('Failed to complete visit:', error);
      }
    }
  };

  const cancelComplete = () => {
    setCompleteModalVisible(false);
    setSelectedVisit(null);
  };

  const confirmDelete = async () => {
    if (selectedVisit) {
      try {
        await deleteVisit(selectedVisit.id);
        setDeleteModalVisible(false);
        setSelectedVisit(null);
      } catch (error) {
        // Error is already handled in the store, but you could add additional UI feedback here
        console.error('Failed to delete visit:', error);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setSelectedVisit(null);
  };

  const handleAddVisit = () => {
    setAddModalVisible(true);
  };

  const validateForm = () => {
    if (!formData.date.trim()) {
      Alert.alert('Error', 'Por favor ingrese una fecha');
      return false;
    }
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Por favor ingrese un nombre');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Por favor ingrese una dirección');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Por favor ingrese un número de teléfono');
      return false;
    }
    
    // No need for date format validation since it's set by the date picker
    
    return true;
  };

  const confirmAddVisit = async () => {
    if (!validateForm()) return;
    
    // Set the selected date to 23:59:59 for the API call
    const apiDate = new Date(selectedDate);
    apiDate.setHours(23, 59, 59, 999);
    
    const newVisit = {
      date: apiDate.toISOString(),
      name: formData.name,
      address: formData.address,
      phone: formData.phone
    };
    
    try {
      await addVisit(newVisit);
    setAddModalVisible(false);
    setShowDatePicker(false);
    resetForm();
    } catch (error) {
      // Error is already handled in the store, but you could add additional UI feedback here
      console.error('Failed to add visit:', error);
    }
  };

  const cancelAddVisit = () => {
    setAddModalVisible(false);
    setShowDatePicker(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: '',
      name: '',
      address: '',
      phone: ''
    });
    setSelectedDate(new Date());
    setShowDatePicker(false);
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('es-AR', { 
        weekday: 'short', 
        day: 'numeric' 
      });
      setFormData({...formData, date: formattedDate});
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
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
        <ThemedView style={styles.header}>
          <IconSymbol
            size={60}
            color="#2196F3"
            name="calendar"
            style={styles.headerIcon}
          />
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.titleText}>Próximas visitas</ThemedText>
          </View>
        </ThemedView>
      
      <ThemedView style={styles.tableContainer}>
        {/* Table Header */}
        <ThemedView style={styles.tableHeader}>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Día</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Nombre</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Dirección</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Teléfono</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeaderActions}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Acciones</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Table Rows */}
        <ScrollView style={styles.tableBody}>
          {isLoading ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <ThemedText style={styles.loadingText}>Cargando visitas...</ThemedText>
            </ThemedView>
          ) : error ? (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => fetchVisits(VisitStatus.PENDING)}
              >
                <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : visits.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No hay visitas programadas</ThemedText>
            </ThemedView>
          ) : (
            visits
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((visit) => (
              <ThemedView key={visit.id} style={styles.tableRow}>
                <ThemedView style={styles.column}>
                  <ThemedText style={styles.cellText}>
                    {new Date(visit.date).toLocaleDateString('es-AR', { 
                      weekday: 'short', 
                      day: 'numeric' 
                    })}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.column}>
                  <ThemedText style={styles.cellText}>{visit.name}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.column}>
                  <ThemedText style={styles.cellText} numberOfLines={2}>{visit.address}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.column}>
                  <ThemedText style={styles.cellText}>{visit.phone}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.columnActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => handleCompleteVisit(visit.id, visit.name)}
                  >
                    <ThemedText style={styles.buttonIcon}>✔️</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteVisit(visit.id, visit.name)}
                  >
                    <ThemedText style={styles.buttonIcon}>❌</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            ))
          )}
        </ScrollView>
        
        {/* Add New Visit Button */}
        <ThemedView style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddVisit}
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
          <ThemedView style={styles.modalContainer}>
            <ThemedView style={styles.modalHeader}>
              <IconSymbol size={40} name="exclamationmark.triangle" color="#F44336" />
              <ThemedText type="subtitle" style={styles.modalTitle}>Eliminar visita</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.modalBody}>
              <ThemedText style={styles.modalText}>
                ¿Eliminar la visita con {selectedVisit?.name}?
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

      {/* Complete Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={completeModalVisible}
        onRequestClose={cancelComplete}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContainer}>
            <ThemedView style={styles.modalHeader}>
              <IconSymbol size={40} name="checkmark.circle" color="#4CAF50" />
              <ThemedText type="subtitle" style={styles.modalTitle}>Completar visita</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.modalBody}>
              <ThemedText style={styles.modalText}>
                ¿Marcar la visita con {selectedVisit?.name} como completada?
              </ThemedText>
              <ThemedText style={styles.modalSubtext}>
                Esto marcará la visita como finalizada.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelComplete}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmCompleteButton]}
                onPress={confirmComplete}
              >
                <ThemedText style={styles.completeButtonText}>Completar</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </View>
      </Modal>

      {/* Add New Visit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={cancelAddVisit}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.formModalContainer}>
            <ThemedView style={styles.modalHeader}>
              <IconSymbol size={40} name="plus.circle" color="#2196F3" />
              <ThemedText type="subtitle" style={styles.modalTitle}>Agregar visita</ThemedText>
            </ThemedView>
            
            <ScrollView style={styles.formContainer}>
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Fecha *</ThemedText>
                <TouchableOpacity
                  style={[styles.datePickerButton, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor }]}
                  onPress={showDatePickerModal}
                >
                  <ThemedText style={styles.datePickerText}>
                    {formData.date || 'Seleccionar Fecha'}
                  </ThemedText>
                  <IconSymbol size={20} name="calendar" color="#2196F3" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Nombre *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, color: textColor }]}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Ingrese el nombre de la persona"
                  placeholderTextColor="#999"
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Dirección *</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, color: textColor }]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({...formData, address: text})}
                  placeholder="Ingrese la dirección completa"
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={3}
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Teléfono *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBackgroundColor, borderColor: inputBorderColor, color: textColor }]}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  placeholder="1122435566"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </ThemedView>

              <ThemedText style={styles.requiredNote}>* Campos obligatorios</ThemedText>
            </ScrollView>

            <ThemedView style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelAddVisit}
              >
                <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmAddButton]}
                onPress={confirmAddVisit}
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
  tableContainer: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 16,
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
  completeButton: {
    backgroundColor: 'transparent',
  },
  deleteButton: {
    backgroundColor: 'transparent',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
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
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  confirmCompleteButton: {
    backgroundColor: '#4caf50',
    borderWidth: 1,
    borderColor: '#388e3c',
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
  completeButtonText: {
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  datePickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  datePickerText: {
    fontSize: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
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
