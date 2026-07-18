/**
 * incidentService.ts — Service for Security Incidents and Dispatch
 */
import { Incident } from '../types';

export const incidentService = {
  /**
   * Registers a new live incident event in the database
   */
  createIncidentReport(nodeId: string, category: Incident['type'], desc?: string): Incident {
    const timestamp = Date.now();
    const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      id: incidentId,
      type: category,
      severity: category === 'security' || category === 'fire' || category === 'lost-child' ? 'high' : 'low',
      location: `Section ${nodeId.replace('Sec', '')}`,
      nodeId,
      description: desc || `${category.toUpperCase()} incident registered at Section ${nodeId.replace('Sec', '')}.`,
      localizedDescription: desc ? null : `Incidente de tipo ${category} registrado en la Sección ${nodeId.replace('Sec', '')}.`,
      status: 'active',
      detectedBy: 'Staff Tablet Trigger',
      assignedVolunteerId: null,
      timestamp,
      lastUpdated: timestamp
    };
  },

  /**
   * Search lost-and-found database catalog
   */
  searchLostRegistry(searchTerm: string, lostItemsState: any[]) {
    const query = searchTerm.toLowerCase();
    return lostItemsState.filter(item =>
      item.description.toLowerCase().includes(query) ||
      item.foundLocation.toLowerCase().includes(query)
    );
  }
};
