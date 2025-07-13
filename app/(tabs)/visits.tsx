import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useVisitsStore } from '@/store/visitsStore';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function VisitsScreen() {
  const { visits, deleteVisit, completeVisit } = useVisitsStore();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [completeModalVisible, setCompleteModalVisible] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<{id: number, name: string} | null>(null);

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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="calendar"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Future Visits</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.tableContainer}>
        {/* Table Header */}
        <ThemedView style={styles.tableHeader}>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Day</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Name</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Address</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeader}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Phone</ThemedText>
          </ThemedView>
          <ThemedView style={styles.columnHeaderActions}>
            <ThemedText type="defaultSemiBold" style={styles.headerText}>Actions</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Table Rows */}
        <ScrollView style={styles.tableBody}>
          {visits
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
                  <IconSymbol size={18} name="checkmark.circle" color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteVisit(visit.id, visit.name)}
                >
                  <IconSymbol size={18} name="xmark.circle" color="#FFFFFF" />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          ))}
        </ScrollView>
        
        {/* Add New Visit Button */}
        <ThemedView style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              // TODO: Implement add new visit functionality
              console.log('Add new visit pressed');
            }}
          >
            <IconSymbol size={20} name="plus.circle" color="#FFFFFF" />
            <ThemedText style={styles.addButtonText}>Add New Visit</ThemedText>
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
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  tableContainer: {
    flex: 1,
    marginTop: 8,
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
    backgroundColor: '#4CAF50',
    borderColor: '#45A049',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderColor: '#D32F2F',
  },
  cellText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  addButtonContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  addButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    minWidth: 300,
    maxWidth: 400,
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
});
