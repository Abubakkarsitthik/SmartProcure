import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialCentres,
  initialFarmers,
  initialOfficers,
  initialAdmins,
  initialRequests,
  initialNotifications,
  historicalArrivals,
  initialQueueItems
} from '../data/initialData';

const ProcurementContext = createContext();

// Safe JSON parser helper for localStorage
const safeJSONParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
};

// Safe serving token loader with fallback
const safeServingToken = () => {
  try {
    const item = localStorage.getItem('sp_serving_token');
    if (!item) return 157;
    const num = parseInt(item, 10);
    return isNaN(num) ? 157 : num;
  } catch {
    return 157;
  }
};

export const ProcurementProvider = ({ children }) => {
  const [centres, setCentres] = useState(() => safeJSONParse('sp_centres', initialCentres));
  const [requests, setRequests] = useState(() => safeJSONParse('sp_requests', initialRequests));
  const [notifications, setNotifications] = useState(() => safeJSONParse('sp_notifications', initialNotifications));
  const [currentServingToken, setCurrentServingToken] = useState(safeServingToken);
  const [queueItems, setQueueItems] = useState(() => safeJSONParse('sp_queue_items', initialQueueItems));
  const [currentUser, setCurrentUser] = useState(() => safeJSONParse('sp_current_user', null));
  const [officers, setOfficers] = useState(() => safeJSONParse('sp_officers', initialOfficers));
  const [farmers, setFarmers] = useState(() => safeJSONParse('sp_farmers', initialFarmers));
  const [admins] = useState(initialAdmins);

  // LocalStorage Persistence Effects
  useEffect(() => {
    localStorage.setItem('sp_centres', JSON.stringify(centres));
  }, [centres]);

  useEffect(() => {
    localStorage.setItem('sp_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('sp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('sp_serving_token', currentServingToken.toString());
  }, [currentServingToken]);

  useEffect(() => {
    localStorage.setItem('sp_queue_items', JSON.stringify(queueItems));
  }, [queueItems]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sp_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sp_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sp_officers', JSON.stringify(officers));
  }, [officers]);

  useEffect(() => {
    localStorage.setItem('sp_farmers', JSON.stringify(farmers));
  }, [farmers]);

  // Toggle user active/inactive status (Admin user management)
  const toggleUserStatus = (userId, role) => {
    if (role === 'officer') {
      setOfficers(prev => prev.map(o => {
        if (o.id === userId) {
          const newStatus = o.status === 'Active' ? 'Inactive' : 'Active';
          addNotification(`Officer ${o.name} status changed to ${newStatus}.`);
          return { ...o, status: newStatus };
        }
        return o;
      }));
    } else if (role === 'farmer') {
      setFarmers(prev => prev.map(f => {
        if (f.id === userId) {
          const newStatus = (f.status || 'Active') === 'Active' ? 'Inactive' : 'Active';
          addNotification(`Farmer ${f.name} status changed to ${newStatus}.`);
          return { ...f, status: newStatus };
        }
        return f;
      }));
    }
  };

  // Unique Notification ID Generator (Collision-safe)
  const addNotification = (text) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString([], { day: '2-digit', month: 'short' });
    const uniqueId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    const newNotif = {
      id: uniqueId,
      text,
      timestamp: `${dateStr} ${timeStr}`,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Collision-Safe Dynamic Request ID Generator
  const generateNextRequestId = () => {
    let maxNum = 1;
    requests.forEach(r => {
      if (r.id && r.id.startsWith('PR')) {
        const numPart = parseInt(r.id.replace('PR', ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
    });
    return `PR${String(maxNum + 1).padStart(3, '0')}`;
  };

  // Dynamic Unique Token Number Generator
  const generateNextTokenNumber = () => {
    let maxToken = 156;
    requests.forEach(r => {
      if (r.tokenNumber) {
        const num = parseInt(r.tokenNumber, 10);
        if (!isNaN(num) && num > maxToken) {
          maxToken = num;
        }
      }
    });
    queueItems.forEach(q => {
      if (q.token) {
        const num = parseInt(q.token, 10);
        if (!isNaN(num) && num > maxToken) {
          maxToken = num;
        }
      }
    });
    return String(maxToken + 1);
  };

  // Dynamic Queue Calculation Helpers
  const calculateFarmersAhead = (tokenNumber) => {
    const parsedToken = parseInt(tokenNumber, 10);
    if (isNaN(parsedToken)) return 0;
    return Math.max(0, parsedToken - currentServingToken);
  };

  const calculateEstimatedWait = (tokenNumber, centreId = 'centre-b') => {
    const centre = centres.find(c => c.id === centreId) || centres[0];
    if (!centre) return 0;
    
    const parsedToken = parseInt(tokenNumber, 10);
    if (isNaN(parsedToken)) return 0;

    const position = parsedToken - currentServingToken;
    if (position <= 0) return 0;

    const counters = centre.counters || 2;
    const processingRate = centre.processingRate || 8;

    return Math.max(5, Math.round((position / counters) * processingRate));
  };

  // Helper: Filter eligible facilities for a district & crop
  const getEligibleFacilities = (district, crop, requestedQty = 0) => {
    const qty = Number(requestedQty) || 0;
    return centres
      .filter(c => {
        // Active status check
        if (c.status === 'Inactive' || c.operatingStatus === 'Inactive') return false;
        // District check
        if (c.district !== district) return false;
        // Procurement capability rule: Must NOT be Godown-only
        if (c.type === 'Godown') return false;
        // Crop compatibility check
        if (crop && c.cropsSupported) {
          const match = c.cropsSupported.some(facCrop => {
            if (facCrop === crop) return true;
            const fLower = (facCrop || '').toLowerCase().trim();
            const cLower = (crop || '').toLowerCase().trim();
            if (fLower === cLower) return true;
            if (fLower === 'paddy' && cLower.includes('paddy')) return true;
            if (fLower === 'cotton' && cLower.includes('cotton')) return true;
            if (fLower === 'maize' && cLower.includes('maize')) return true;
            if (fLower === 'sugarcane' && cLower.includes('sugarcane')) return true;
            if (fLower === 'pulses' && (cLower.includes('gram') || cLower.includes('pulse') || cLower.includes('tur') || cLower.includes('urad') || cLower.includes('chickpea'))) return true;
            if (cLower.startsWith(fLower) || fLower.startsWith(cLower)) return true;
            return false;
          });
          if (!match) return false;
        }
        return true;
      })
      .map(c => {
        const capacityAvailable = c.capacityRemaining >= qty && c.capacityRemaining > 0;
        const predictedWait = Math.max(5, Math.round(((c.queueLength || 10) / (c.counters || 2)) * (c.processingRate || 8)));
        return {
          ...c,
          capacityAvailable,
          capacityStatus: capacityAvailable ? 'Capacity Available' : 'Insufficient Capacity',
          predictedWait
        };
      });
  };

  // Facility Master Management Actions
  const addFacility = (facilityData) => {
    const exists = centres.some(
      c => c.facilityNumber && c.facilityNumber.toLowerCase().trim() === (facilityData.facilityNumber || '').toLowerCase().trim()
    );
    if (exists) {
      return { success: false, error: 'Facility number already exists.' };
    }

    const newId = `fac-${Date.now()}`;
    const totalCap = Number(facilityData.totalCapacity) || 1000;
    const unit = facilityData.capacityUnit || 'Quintals';
    const quintals = unit === 'kg' ? Math.round(totalCap / 100) : totalCap;
    const kgCap = unit === 'kg' ? totalCap : totalCap * 100;

    const newFacility = {
      id: newId,
      facilityNumber: (facilityData.facilityNumber || `FAC-${Date.now().toString().slice(-4)}`).trim(),
      name: (facilityData.facilityName || 'Procurement Yard').trim(),
      state: facilityData.state || 'Tamil Nadu',
      district: facilityData.district || 'Madurai',
      city: (facilityData.city || facilityData.district || 'Madurai').trim(),
      type: facilityData.facilityType || 'Procurement Centre',
      location: `${facilityData.city || facilityData.district}, ${facilityData.district}`,
      cropsSupported: facilityData.cropsSupported || ['Paddy'],
      totalCapacity: kgCap,
      dailyCapacity: kgCap,
      capacityRemaining: kgCap,
      capacityUnit: unit,
      queueLength: 0,
      waitTime: 0,
      expectedFarmers: 0,
      capacityQuintals: quintals,
      currentExpectedQuintals: 0,
      riskLevel: 'Low',
      overloadApproved: false,
      counters: facilityData.facilityType === 'Godown' ? 0 : 2,
      processingRate: facilityData.facilityType === 'Godown' ? 0 : 8,
      operatingStatus: facilityData.status || 'Operating',
      status: facilityData.status || 'Operating',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCentres(prev => [newFacility, ...prev]);
    addNotification(`New Facility ${newFacility.name} (${newFacility.facilityNumber}) created in ${newFacility.district}.`);
    return { success: true, facility: newFacility };
  };

  const updateFacility = (facilityId, updatedData) => {
    const existing = centres.find(c => c.id === facilityId);
    if (!existing) return { success: false, error: 'Facility not found.' };

    if (updatedData.facilityNumber && updatedData.facilityNumber.toLowerCase().trim() !== (existing.facilityNumber || '').toLowerCase().trim()) {
      const duplicate = centres.some(
        c => c.id !== facilityId && c.facilityNumber && c.facilityNumber.toLowerCase().trim() === updatedData.facilityNumber.toLowerCase().trim()
      );
      if (duplicate) {
        return { success: false, error: 'Facility number already exists.' };
      }
    }

    setCentres(prev => prev.map(c => {
      if (c.id === facilityId) {
        const totalCap = updatedData.totalCapacity !== undefined ? Number(updatedData.totalCapacity) : (c.totalCapacity || 1000);
        const unit = updatedData.capacityUnit || c.capacityUnit || 'kg';
        const kgCap = unit === 'kg' ? totalCap : totalCap * 100;
        const quintals = unit === 'kg' ? Math.round(totalCap / 100) : totalCap;

        return {
          ...c,
          ...updatedData,
          name: updatedData.facilityName ? updatedData.facilityName.trim() : c.name,
          facilityNumber: updatedData.facilityNumber ? updatedData.facilityNumber.trim() : c.facilityNumber,
          totalCapacity: kgCap,
          capacityRemaining: updatedData.capacityRemaining !== undefined ? Number(updatedData.capacityRemaining) : Math.min(c.capacityRemaining, kgCap),
          capacityQuintals: quintals,
          operatingStatus: updatedData.status || c.operatingStatus || 'Operating',
          status: updatedData.status || c.status || 'Operating'
        };
      }
      return c;
    }));

    addNotification(`Facility ${updatedData.facilityName || existing.name} updated successfully.`);
    return { success: true };
  };

  const toggleFacilityStatus = (facilityId) => {
    setCentres(prev => prev.map(c => {
      if (c.id === facilityId) {
        const newStatus = (c.status === 'Operating' || c.operatingStatus === 'Operating') ? 'Inactive' : 'Operating';
        addNotification(`Facility ${c.name} status updated to ${newStatus}.`);
        return {
          ...c,
          status: newStatus,
          operatingStatus: newStatus
        };
      }
      return c;
    }));
  };

  const importFacilities = (facilitiesList) => {
    let addedCount = 0;
    const existingNos = new Set(centres.map(c => (c.facilityNumber || '').toLowerCase().trim()));

    const newItems = [];
    facilitiesList.forEach((fac, idx) => {
      const facNo = (fac.facilityNumber || fac.godownNo || `FAC-${idx}`).toString().trim();
      if (existingNos.has(facNo.toLowerCase())) return;
      existingNos.add(facNo.toLowerCase());

      const totalCap = Number(fac.capacity || fac.totalCapacity) || 2000;
      const unit = fac.unit || fac.capacityUnit || 'Quintals';
      const kgCap = unit === 'kg' ? totalCap : totalCap * 100;
      const quintals = unit === 'kg' ? Math.round(totalCap / 100) : totalCap;

      newItems.push({
        id: `fac-imp-${Date.now()}-${idx}`,
        facilityNumber: facNo,
        name: (fac.facilityName || fac.godownName || `Facility ${facNo}`).trim(),
        state: fac.state || 'Tamil Nadu',
        district: fac.district || 'Madurai',
        city: fac.city || fac.district || 'Madurai',
        type: fac.facilityType || 'Procurement Centre',
        location: `${fac.city || fac.district}, ${fac.district || 'Madurai'}`,
        cropsSupported: Array.isArray(fac.cropsSupported) 
          ? fac.cropsSupported 
          : typeof fac.cropsSupported === 'string' 
            ? fac.cropsSupported.split(',').map(s => s.trim()) 
            : ['Paddy'],
        totalCapacity: kgCap,
        dailyCapacity: kgCap,
        capacityRemaining: kgCap,
        capacityUnit: unit,
        queueLength: 0,
        waitTime: 0,
        expectedFarmers: 0,
        capacityQuintals: quintals,
        currentExpectedQuintals: 0,
        riskLevel: 'Low',
        overloadApproved: false,
        counters: fac.facilityType === 'Godown' ? 0 : 3,
        processingRate: fac.facilityType === 'Godown' ? 0 : 8,
        operatingStatus: fac.status || 'Operating',
        status: fac.status || 'Operating',
        createdAt: new Date().toISOString().split('T')[0]
      });
      addedCount++;
    });

    if (addedCount > 0) {
      setCentres(prev => [...newItems, ...prev]);
      addNotification(`Excel Import Complete: ${addedCount} procurement facilities added to master data.`);
    }
    return { success: true, count: addedCount };
  };

  // Helper: Calculate AI Recommendation
  const getAIRecommendation = (district, crop, requestedQty = 0) => {
    const eligible = getEligibleFacilities(district, crop, requestedQty);
    
    // Filter facilities with sufficient remaining capacity
    const availableFacilities = eligible.filter(c => c.capacityAvailable);

    if (availableFacilities.length === 0) {
      if (eligible.length > 0) {
        const sortedEligible = [...eligible].sort((a, b) => a.predictedWait - b.predictedWait);
        const fallback = sortedEligible[0];
        return {
          recommendedFacility: fallback,
          predictedWait: fallback.predictedWait,
          queue: fallback.queueLength,
          remainingCapacity: fallback.capacityRemaining,
          reason: `High capacity demand in ${district}. ${fallback.name} supports ${crop} (Remaining: ${fallback.capacityRemaining.toLocaleString('en-IN')} kg). Officer review required.`,
          eligibleList: eligible
        };
      }
      return {
        recommendedFacility: null,
        reason: `No suitable procurement facility is currently available for ${crop} in ${district}.`,
        eligibleList: []
      };
    }

    // Rank by lowest predicted wait time, then lowest queue length
    const sorted = [...availableFacilities].sort((a, b) => {
      if (a.predictedWait !== b.predictedWait) return a.predictedWait - b.predictedWait;
      return a.queueLength - b.queueLength;
    });

    const best = sorted[0];
    return {
      recommendedFacility: best,
      predictedWait: best.predictedWait,
      queue: best.queueLength,
      remainingCapacity: best.capacityRemaining,
      reason: `Recommended because ${best.name} supports ${crop}, has sufficient remaining capacity (${best.capacityRemaining.toLocaleString('en-IN')} kg), and currently has lower predicted congestion (${best.predictedWait} mins wait).`,
      eligibleList: eligible
    };
  };

  // Submit request function (Allows multiple requests per farmer with collision-free IDs)
  const submitRequest = (formData) => {
    const requestId = generateNextRequestId();
    const aiRec = getAIRecommendation(formData.district || 'Madurai', formData.crop, formData.quantity);

    const newRequest = {
      id: requestId,
      farmerId: formData.farmerId,
      farmerName: formData.farmerName,
      crop: formData.crop,
      variety: formData.variety || 'Standard MSP Grade',
      quantity: Number(formData.quantity),
      unit: formData.unit || 'kg',
      village: formData.village || 'Vadipatti',
      state: formData.state || 'Tamil Nadu',
      district: formData.district || 'Madurai',
      readinessDate: formData.readinessDate || new Date().toISOString().split('T')[0],
      status: 'Pending Officer Approval',
      centreId: null,
      centreName: null,
      aiRecommendedCentreId: aiRec.recommendedFacility ? aiRec.recommendedFacility.id : null,
      aiRecommendedCentreName: aiRec.recommendedFacility ? aiRec.recommendedFacility.name : null,
      aiReason: aiRec.reason,
      appointmentDate: null,
      appointmentSlot: null,
      tokenNumber: null,
      paymentStatus: 'PAYMENT PENDING'
    };

    setRequests(prev => [newRequest, ...prev]);
    addNotification(`Procurement request ${requestId} submitted for ${formData.crop} (${formData.quantity} ${formData.unit || 'kg'}) in ${formData.district}.`);
    return newRequest;
  };

  // Approve / Reject requests
  const approveRequest = (requestId) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        addNotification(`Request ${requestId} has been approved by Procurement Officer.`);
        return { ...req, status: 'Approved' };
      }
      return req;
    }));
  };

  const rejectRequest = (requestId, reason) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        addNotification(`Request ${requestId} rejected. Reason: ${reason}`);
        return { ...req, status: 'Rejected', rejectionReason: reason };
      }
      return req;
    }));
  };

  // Assign Centre
  const assignCentre = (requestId, centreId) => {
    const centre = centres.find(c => c.id === centreId);
    if (!centre) return;

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        addNotification(`Centre ${centre.name} assigned to request ${requestId}.`);
        return { 
          ...req, 
          status: 'Centre Assigned', 
          centreId: centre.id, 
          centreName: centre.name 
        };
      }
      return req;
    }));
  };

  // Assign Slot & Dynamic Token
  const assignSlotAndToken = (requestId, date, slot) => {
    const req = requests.find(r => r.id === requestId);
    const tokenNumber = generateNextTokenNumber();

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        addNotification(`Token #${tokenNumber} generated for request ${requestId}. Scheduled slot: ${slot} on ${date}.`);
        return {
          ...r,
          status: 'Scheduled',
          appointmentDate: date,
          appointmentSlot: slot,
          tokenNumber: tokenNumber
        };
      }
      return r;
    }));

    if (req?.centreId) {
      setCentres(prev => prev.map(c => {
        if (c.id === req.centreId) {
          return { ...c, queueLength: (c.queueLength || 0) + 1 };
        }
        return c;
      }));
    }

    setQueueItems(prev => [
      ...prev,
      { 
        token: tokenNumber, 
        farmerName: req ? req.farmerName : 'Farmer', 
        requestId: requestId, 
        status: 'Scheduled', 
        crop: req ? req.crop : 'Produce', 
        quantity: req ? req.quantity : 500 
      }
    ]);
  };

  // Update Procurement Stage
  const updateProcurementStage = (requestId, newStatus) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        addNotification(`Status updated for request ${requestId}: ${newStatus}.`);
        return { ...r, status: newStatus };
      }
      return r;
    }));

    setQueueItems(prev => prev.map(item => {
      if (item.requestId === requestId) {
        return { 
          ...item, 
          status: newStatus === 'Arrived' ? 'Arrived' : newStatus === 'Completed' ? 'Completed' : 'Processing' 
        };
      }
      return item;
    }));
  };

  // Complete Procurement
  const completeProcurement = (requestId, actualQty, amount) => {
    const targetReq = requests.find(r => r.id === requestId);
    const token = targetReq?.tokenNumber || '157';
    const refNum = `PROC-2026-00${token}`;

    if (targetReq?.centreId) {
      const actualNum = Number(actualQty) || 0;
      setCentres(prev => prev.map(c => {
        if (c.id === targetReq.centreId) {
          const newCap = Math.max(0, (c.capacityRemaining || c.totalCapacity || 1000) - actualNum);
          const newQueue = Math.max(0, (c.queueLength || 1) - 1);
          return {
            ...c,
            capacityRemaining: newCap,
            queueLength: newQueue
          };
        }
        return c;
      }));
    }

    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        addNotification(`Procurement completed for ${r.id}. Measured Qty: ${actualQty} kg, Value: ₹${Number(amount).toLocaleString('en-IN')}.`);
        return {
          ...r,
          status: 'Completed',
          actualQuantity: Number(actualQty),
          procurementAmount: Number(amount),
          referenceNumber: refNum,
          paymentStatus: 'PAYMENT PENDING'
        };
      }
      return r;
    }));

    setQueueItems(prev => prev.map(item => {
      if (item.requestId === requestId) {
        return { ...item, status: 'Completed' };
      }
      return item;
    }));
  };

  // Payment Status Simulation
  const updatePaymentStatus = (requestId, newPaymentStatus) => {
    setRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        addNotification(`Payment status for request ${requestId} updated to: ${newPaymentStatus}.`);
        return { ...r, paymentStatus: newPaymentStatus };
      }
      return r;
    }));
  };

  // Advance Queue Serving Token
  const advanceQueue = () => {
    setCurrentServingToken(prev => prev + 1);
    addNotification(`Serving Counter advanced. Now serving token #${currentServingToken + 1}.`);
  };

  // Refresh Queue Calculation Trigger
  const refreshQueue = () => {
    addNotification('Queue status refreshed with live counter data.');
  };

  // Overload Redistribution Approval
  const approveRedistribution = (sourceCentreId, targetCentreId) => {
    setCentres(prev => prev.map(c => {
      if (c.id === sourceCentreId) {
        return { ...c, overloadApproved: true, riskLevel: 'Managed' };
      }
      return c;
    }));
    addNotification(`AI Redistribution approved for ${sourceCentreId}. Excess load redirected to ${targetCentreId}.`);
  };

  // Clean System Reset Function
  const resetDemo = () => {
    localStorage.removeItem('sp_centres');
    localStorage.removeItem('sp_requests');
    localStorage.removeItem('sp_notifications');
    localStorage.removeItem('sp_serving_token');
    localStorage.removeItem('sp_queue_items');
    localStorage.removeItem('sp_current_user');

    setCentres(initialCentres);
    setRequests(initialRequests);
    setNotifications(initialNotifications);
    setCurrentServingToken(157);
    setQueueItems(initialQueueItems);
    setCurrentUser(null);
  };

  // Logout Function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sp_current_user');
  };

  // Update profile details
  const updateProfile = (data) => {
    setCurrentUser(prev => ({
      ...prev,
      ...data
    }));
    addNotification('Profile updated successfully.');
  };

  return (
    <ProcurementContext.Provider value={{
      centres,
      requests,
      notifications,
      currentServingToken,
      queueItems,
      currentUser,
      historicalArrivals,
      initialFarmers,
      farmers,
      officers,
      admins,
      setCurrentUser,
      getEligibleFacilities,
      getAIRecommendation,
      addFacility,
      updateFacility,
      toggleFacilityStatus,
      importFacilities,
      submitRequest,
      approveRequest,
      rejectRequest,
      assignCentre,
      assignSlotAndToken,
      updateProcurementStage,
      completeProcurement,
      updatePaymentStatus,
      advanceQueue,
      refreshQueue,
      approveRedistribution,
      toggleUserStatus,
      resetDemo,
      logout,
      updateProfile,
      calculateFarmersAhead,
      calculateEstimatedWait,
      addNotification
    }}>
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => useContext(ProcurementContext);
