import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useVisitsStore } from '@/store/visitsStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function VisitsScreen() {
  const { visits, isLoading, error, deleteVisit, completeVisit, addVisit, fetchVisits } = useVisitsStore();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<{id: number, name: string} | null>(null);
  
  // Fetch visits when component mounts
  useEffect(() => {
    fetchVisits();
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

  const handleCompleteVisit = (visitId: number, visitorName: string) => {
    setSelectedVisit({ id: visitId, name: visitorName });
    setCompleteModalVisible(true);
  };

  const handleDeleteVisit = (visitId: number, visitorName: string) => {
    setSelectedVisit({ id: visitId, name: visitorName });
    setDeleteModalVisible(true);
  };

  const confirmComplete = () => {
    if (selectedVisit) {
      completeVisit(selectedVisit.id);
      setCompleteModalVisible(false);
      setSelectedVisit(null);
    }
  };

  const cancelComplete = () => {
    setCompleteModalVisible(false);
    setSelectedVisit(null);
  };

  const confirmDelete = () => {
    if (selectedVisit) {
      deleteVisit(selectedVisit.id);
      setDeleteModalVisible(false);
      setSelectedVisit(null);
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
      Alert.alert('Error', 'Please enter a date');
      return false;
    }
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter a phone number');
      return false;
    }
    
    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      Alert.alert('Error', 'Please enter date in YYYY-MM-DD format');
      return false;
    }
    
    return true;
  };

  const confirmAddVisit = () => {
    if (!validateForm()) return;
    
    const newVisit = {
      id: Date.now(), // Simple ID generation
      date: formData.date,
      name: formData.name,
      address: formData.address,
      phone: formData.phone
    };
    
    addVisit(newVisit);
    setAddModalVisible(false);
    setShowDatePicker(false);
    resetForm();
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
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      setFormData({...formData, date: formattedDate});
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol
            size={60}
            color="#2196F3"
            name="calendar"
            style={styles.headerIcon}
          />
          <View style={styles.titleContainer}>
            <ThemedText type="title" style={styles.titleText}>Future Visits</ThemedText>
          </View>
        </View>
      
      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <View style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Day</ThemedText>
          </View>
          <View style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Name</ThemedText>
          </View>
          <View style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Address</ThemedText>
          </View>
          <View style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Phone</ThemedText>
          </View>
          <View style={styles.columnHeaderActions}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Actions</ThemedText>
          </View>
        </View>

        {/* Table Rows */}
        <ScrollView style={styles.tableBody}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <ThemedText style={styles.loadingText}>Loading visits...</ThemedText>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchVisits}
              >
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          ) : visits.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No visits scheduled</ThemedText>
            </View>
          ) : (
            visits
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((visit) => (
              <View key={visit.id} style={styles.tableRow}>
                <View style={styles.column}>
                  <ThemedText style={styles.cellText}>
                    {new Date(visit.date).toLocaleDateString('es-AR', { 
                      weekday: 'short', 
                      day: 'numeric' 
                    })}
                  </ThemedText>
                </View>
                <View style={styles.column}>
                  <ThemedText style={styles.cellText}>{visit.name}</ThemedText>
                </View>
                <View style={styles.column}>
                  <ThemedText style={styles.cellText} numberOfLines={2}>{visit.address}</ThemedText>
                </View>
                <View style={styles.column}>
                  <ThemedText style={styles.cellText}>{visit.phone}</ThemedText>
                </View>
                <View style={styles.columnActions}>
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
                </View>
              </View>
            ))
          )}
        </ScrollView>
        
        {/* Add New Visit Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddVisit}
          >
            <ThemedText style={styles.addButtonIcon}>➕</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

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
              <ThemedText type="subtitle" style={styles.modalTitle}>Delete Visit</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.modalBody}>
              <ThemedText style={styles.modalText}>
                Are you sure you want to delete the visit with {selectedVisit?.name}?
              </ThemedText>
              <ThemedText style={styles.modalSubtext}>
                This action cannot be undone.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmDeleteButton]}
                onPress={confirmDelete}
              >
                <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
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
              <ThemedText type="subtitle" style={styles.modalTitle}>Complete Visit</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.modalBody}>
              <ThemedText style={styles.modalText}>
                Mark visit with {selectedVisit?.name} as completed?
              </ThemedText>
              <ThemedText style={styles.modalSubtext}>
                This will mark the visit as finished.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelComplete}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmCompleteButton]}
                onPress={confirmComplete}
              >
                <ThemedText style={styles.completeButtonText}>Complete</ThemedText>
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
              <ThemedText type="subtitle" style={styles.modalTitle}>Add New Visit</ThemedText>
            </ThemedView>
            
            <ScrollView style={styles.formContainer}>
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Date *</ThemedText>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={showDatePickerModal}
                >
                  <ThemedText style={styles.datePickerText}>
                    {formData.date || 'Select Date'}
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
                <ThemedText style={styles.inputLabel}>Name *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({...formData, name: text})}
                  placeholder="Enter visitor's name"
                  placeholderTextColor="#999"
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Address *</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(text) => setFormData({...formData, address: text})}
                  placeholder="Enter full address"
                  placeholderTextColor="#999"
                  multiline={true}
                  numberOfLines={3}
                />
              </ThemedView>

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Phone *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  placeholder="(555) 123-4567"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </ThemedView>

              <ThemedText style={styles.requiredNote}>* Required fields</ThemedText>
            </ScrollView>

            <ThemedView style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={cancelAddVisit}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmAddButton]}
                onPress={confirmAddVisit}
              >
                <ThemedText style={styles.addButtonTextModal}>Add Visit</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#ffffff',
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
    color: '#333333',
    fontWeight: 'bold',
  },
  tableContainer: {
    flex: 1,
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
    marginBottom: 8,
    backgroundColor: '#ffffff',
  },
  columnHeader: {
    flex: 1,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
  },
  columnHeaderActions: {
    width: 120,
    paddingHorizontal: 4,
    backgroundColor: '#ffffff',
  },
  headerText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333333',
    fontWeight: '600',
  },
  tableBody: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 60,
    backgroundColor: '#ffffff',
  },
  column: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  columnActions: {
    width: 120,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  completeButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    color: '#333333',
  },
  addButtonContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  addButton: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 350,
    maxWidth: 500,
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
    opacity: 0.7,
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
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  confirmDeleteButton: {
    backgroundColor: '#F44336',
  },
  confirmCompleteButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#424242',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButtonText: {
    color: '#FFFFFF',
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 400,
    maxWidth: 600,
    maxHeight: '85%',
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
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  requiredNote: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
  },
  confirmAddButton: {
    backgroundColor: '#2196F3',
  },
  addButtonTextModal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
