import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useProcurement } from '../../context/ProcurementContext';
import { X, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { FACILITY_TYPES } from '../../constants/procurementConstants';

export default function ExcelImportModal({ show, onClose }) {
  const { centres, importFacilities } = useProcurement();

  const [parsedPreview, setParsedPreview] = useState(null);
  const [fileError, setFileError] = useState('');

  if (!show) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');
    setParsedPreview(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        if (!rawData || rawData.length === 0) {
          setFileError('Excel file is empty or contains no data rows.');
          return;
        }

        // Validate rows
        const existingNos = new Set(centres.map(c => (c.facilityNumber || '').toLowerCase().trim()));
        const seenInFile = new Set();

        const validRows = [];
        const invalidRows = [];
        let duplicateCount = 0;

        rawData.forEach((row, index) => {
          const rowNum = index + 2; // header line + 1
          const errors = [];

          // Map column names flexibly
          const state = row['State'] || row['state'] || 'Tamil Nadu';
          const district = row['District'] || row['district'];
          const city = row['City'] || row['city'] || district;
          const godownNo = (row['Godown No'] || row['Godown Number'] || row['Facility No'] || row['Facility ID'] || row['godownNo'] || '').toString().trim();
          const godownName = (row['Godown Name'] || row['Facility Name'] || row['godownName'] || '').toString().trim();
          const facilityType = row['Facility Type'] || row['type'] || row['Type'] || 'Procurement Centre';
          const cropsRaw = row['Crops Supported'] || row['Crops'] || row['cropsSupported'] || 'Paddy';
          const capacity = row['Capacity'] || row['totalCapacity'] || row['Total Capacity'];
          const unit = row['Unit'] || row['Capacity Unit'] || 'Quintals';
          const status = row['Status'] || row['operatingStatus'] || 'Operating';

          if (!district || !district.toString().trim()) {
            errors.push('Missing district');
          }
          if (!godownNo) {
            errors.push('Missing facility number / Godown No');
          }
          if (!godownName) {
            errors.push('Missing facility name');
          }
          if (!capacity || isNaN(Number(capacity)) || Number(capacity) <= 0) {
            errors.push('Invalid or missing capacity');
          }
          if (facilityType && !FACILITY_TYPES.includes(facilityType)) {
            errors.push(`Unsupported facility type '${facilityType}'`);
          }

          // Duplicate checks
          if (godownNo) {
            const lowerNo = godownNo.toLowerCase();
            if (existingNos.has(lowerNo)) {
              errors.push(`Duplicate facility number '${godownNo}' exists in system master data`);
              duplicateCount++;
            } else if (seenInFile.has(lowerNo)) {
              errors.push(`Duplicate facility number '${godownNo}' repeated in Excel file`);
              duplicateCount++;
            } else {
              seenInFile.add(lowerNo);
            }
          }

          const parsedObj = {
            rowNum,
            state: state ? state.toString().trim() : 'Tamil Nadu',
            district: district ? district.toString().trim() : '',
            city: city ? city.toString().trim() : district ? district.toString().trim() : '',
            facilityNumber: godownNo,
            facilityName: godownName,
            facilityType: facilityType ? facilityType.toString().trim() : 'Procurement Centre',
            cropsSupported: typeof cropsRaw === 'string' ? cropsRaw.split(',').map(s => s.trim()) : Array.isArray(cropsRaw) ? cropsRaw : ['Paddy'],
            capacity: Number(capacity) || 0,
            unit: unit ? unit.toString().trim() : 'Quintals',
            status: status ? status.toString().trim() : 'Operating'
          };

          if (errors.length === 0) {
            validRows.push(parsedObj);
          } else {
            invalidRows.push({ rowNum, godownNo, godownName, errors });
          }
        });

        setParsedPreview({
          totalRecords: rawData.length,
          validRows,
          invalidRows,
          duplicateCount
        });

      } catch (err) {
        setFileError('Failed to parse Excel file. Please upload a valid .xlsx or .xls file. ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = () => {
    if (!parsedPreview || parsedPreview.validRows.length === 0) return;
    importFacilities(parsedPreview.validRows);
    onClose();
    setParsedPreview(null);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: '700px', width: '90%' }}>
        <div className="modal-header flex-between">
          <h3 className="modal-title flex-align">
            <FileSpreadsheet size={20} className="text-green-700" />
            IMPORT FACILITIES FROM EXCEL
          </h3>
          <button className="btn btn-outline btn-xs" onClick={() => { onClose(); setParsedPreview(null); }} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <div className="p-4 border-2 border-dashed rounded-lg bg-slate-50 text-center">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
            />
            <p className="text-xs text-muted mt-2">
              Upload Excel sheet with columns: <strong>State, District, City, Godown No, Godown Name, Facility Type, Crops Supported, Capacity, Unit, Status</strong>
            </p>
          </div>

          {fileError && (
            <div className="alert alert-danger text-xs flex-align">
              <AlertTriangle size={16} />
              <span>{fileError}</span>
            </div>
          )}

          {parsedPreview && (
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-slate-800">Import Preview Summary</h4>
              
              <div className="grid-4col text-center text-xs">
                <div className="p-3 bg-slate-100 rounded">
                  <span className="text-muted block font-medium">Total Records</span>
                  <span className="text-lg font-bold text-slate-800">{parsedPreview.totalRecords}</span>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <span className="text-green-700 block font-medium">Valid</span>
                  <span className="text-lg font-bold text-green-700">{parsedPreview.validRows.length}</span>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <span className="text-red-700 block font-medium">Invalid</span>
                  <span className="text-lg font-bold text-red-700">{parsedPreview.invalidRows.length}</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                  <span className="text-amber-700 block font-medium">Duplicates</span>
                  <span className="text-lg font-bold text-amber-700">{parsedPreview.duplicateCount}</span>
                </div>
              </div>

              {parsedPreview.invalidRows.length > 0 && (
                <div className="card" style={{ maxHeight: '180px', overflowY: 'auto', backgroundColor: '#fffcfc', borderColor: 'var(--danger)' }}>
                  <h5 className="text-xs font-bold text-red-700 mb-2 flex-align">
                    <AlertTriangle size={14} /> Invalid Rows & Error Details ({parsedPreview.invalidRows.length})
                  </h5>
                  <div className="space-y-2 text-xs">
                    {parsedPreview.invalidRows.map((inv, idx) => (
                      <div key={idx} className="p-2 border-b border-red-100">
                        <strong>Row {inv.rowNum}:</strong> {inv.godownNo || 'Unknown ID'} ({inv.godownName || 'No Name'}) —{' '}
                        <span className="text-red-600 font-semibold">{inv.errors.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parsedPreview.validRows.length > 0 && (
                <div className="alert alert-success text-xs flex-align">
                  <CheckCircle size={16} />
                  <span>Ready to import {parsedPreview.validRows.length} valid facility records into central master data.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer flex-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-outline btn-sm" onClick={() => { onClose(); setParsedPreview(null); }}>
            CANCEL IMPORT
          </button>
          <button 
            className="btn btn-secondary" 
            disabled={!parsedPreview || parsedPreview.validRows.length === 0}
            onClick={handleConfirmImport}
          >
            IMPORT VALID RECORDS ({parsedPreview?.validRows?.length || 0})
          </button>
        </div>
      </div>
    </div>
  );
}
