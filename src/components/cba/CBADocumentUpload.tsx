/**
 * CBA Document Upload Component
 * Allows uploading, parsing, and importing CBA documents into the knowledge graph
 */

import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader } from 'lucide-react';

interface ContractSection {
  reference: string;
  title: string;
  text: string;
  type: string;
  relevance: number;
}

export default function CBADocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [sections, setSections] = useState<ContractSection[]>([]);
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('http://localhost:3001/api/cba/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setDocumentId(data.document.id);
        setSuccess('Document uploaded successfully!');
        // Auto-parse after upload
        await handleParse(data.document.id);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleParse = async (docId?: string) => {
    const idToUse = docId || documentId;
    if (!idToUse) return;

    setParsing(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3001/api/cba/parse/${idToUse}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSections(data.sections);
        // Select all sections by default
        const allRefs = new Set(data.sections.map((s: ContractSection) => s.reference));
        setSelectedSections(allRefs);
        setSuccess(`Parsed ${data.sections.length} sections from document`);
      } else {
        setError(data.error || 'Parsing failed');
      }
    } catch (err) {
      console.error('Parse error:', err);
      setError('Failed to parse document');
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (sections.length === 0) return;

    setImporting(true);
    setError(null);

    try {
      const sectionsToImport = sections.filter((s) => selectedSections.has(s.reference));

      const response = await fetch('http://localhost:3001/api/cba/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: sectionsToImport }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Successfully imported ${sectionsToImport.length} sections to knowledge graph!`);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to import sections');
    } finally {
      setImporting(false);
    }
  };

  const toggleSection = (reference: string) => {
    const newSelected = new Set(selectedSections);
    if (newSelected.has(reference)) {
      newSelected.delete(reference);
    } else {
      newSelected.add(reference);
    }
    setSelectedSections(newSelected);
  };

  const selectAll = () => {
    const allRefs = new Set(sections.map((s) => s.reference));
    setSelectedSections(allRefs);
  };

  const deselectAll = () => {
    setSelectedSections(new Set());
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload CBA Document</h2>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step 1: Upload */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Upload PDF</h3>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                {file ? file.name : 'Choose PDF file...'}
              </span>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading && <Loader className="w-4 h-4 animate-spin" />}
              Upload & Parse
            </button>
          </div>
        </div>

        {/* Step 2: Review Sections */}
        {parsing && (
          <div className="mb-8 text-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Parsing document with AI...</p>
          </div>
        )}

        {sections.length > 0 && !parsing && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Step 2: Review & Select Sections ({sections.length} found)
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Deselect All
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {sections.map((section) => (
                <div
                  key={section.reference}
                  className={`p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                    selectedSections.has(section.reference) ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleSection(section.reference)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSections.has(section.reference)}
                      onChange={() => toggleSection(section.reference)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{section.reference}</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                          {section.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          Relevance: {(section.relevance * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="font-medium text-gray-800 text-sm mb-1">{section.title}</p>
                      <p className="text-gray-600 text-xs line-clamp-2">{section.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Import */}
        {sections.length > 0 && !parsing && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Step 3: Import to Knowledge Graph
            </h3>
            <button
              onClick={handleImport}
              disabled={selectedSections.size === 0 || importing}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {importing && <Loader className="w-5 h-5 animate-spin" />}
              Import {selectedSections.size} Selected Section{selectedSections.size !== 1 ? 's' : ''} to Neo4j
            </button>
            <p className="text-sm text-gray-600 mt-2 text-center">
              This will add the selected sections to the knowledge graph for AI chat queries
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
