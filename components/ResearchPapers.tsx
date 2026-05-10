import React, { useState } from 'react';
import { BookOpen, Search, Filter, Download, ExternalLink, Users, Calendar, Plus, FileText, Share2 } from 'lucide-react';

interface ResearchPaper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  subject: string;
  year: number;
  doi?: string;
  pdfUrl?: string;
  tags: string[];
  collaborators: number;
  createdAt: string;
}

interface ResearchPapersProps {
  papers: ResearchPaper[];
  onUploadPaper?: (paper: Omit<ResearchPaper, 'id' | 'createdAt'>) => void;
  onJoinCollaboration?: (paperId: string) => void;
}

const ResearchPapers: React.FC<ResearchPapersProps> = ({
  papers,
  onUploadPaper,
  onJoinCollaboration
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newPaper, setNewPaper] = useState({
    title: '',
    abstract: '',
    authors: '',
    subject: '',
    year: new Date().getFullYear(),
    doi: '',
    pdfUrl: '',
    tags: ''
  });

  const subjects = [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Engineering', 'Medicine', 'Psychology', 'Economics', 'Literature',
    'History', 'Philosophy', 'Sociology', 'Anthropology', 'Linguistics'
  ];

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.abstract.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = !selectedSubject || paper.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPaper.title.trim() || !newPaper.abstract.trim()) return;

    onUploadPaper?.({
      title: newPaper.title.trim(),
      abstract: newPaper.abstract.trim(),
      authors: newPaper.authors.split(',').map(a => a.trim()).filter(Boolean),
      subject: newPaper.subject,
      year: newPaper.year,
      doi: newPaper.doi.trim(),
      pdfUrl: newPaper.pdfUrl.trim(),
      tags: newPaper.tags.split(',').map(t => t.trim()).filter(Boolean),
      collaborators: 0
    });

    setNewPaper({
      title: '',
      abstract: '',
      authors: '',
      subject: '',
      year: new Date().getFullYear(),
      doi: '',
      pdfUrl: '',
      tags: ''
    });
    setShowUploadForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-slate-900">Research Papers</h3>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Upload Paper
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search papers, authors, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Upload Research Paper</h4>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newPaper.title}
                onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter paper title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Abstract *
              </label>
              <textarea
                value={newPaper.abstract}
                onChange={(e) => setNewPaper({ ...newPaper, abstract: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                placeholder="Brief summary of your research"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Authors (comma separated)
                </label>
                <input
                  type="text"
                  value={newPaper.authors}
                  onChange={(e) => setNewPaper({ ...newPaper, authors: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="John Doe, Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <select
                  value={newPaper.subject}
                  onChange={(e) => setNewPaper({ ...newPaper, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  min="2000"
                  max={new Date().getFullYear()}
                  value={newPaper.year}
                  onChange={(e) => setNewPaper({ ...newPaper, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  DOI
                </label>
                <input
                  type="text"
                  value={newPaper.doi}
                  onChange={(e) => setNewPaper({ ...newPaper, doi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="10.1000/xyz123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  PDF URL
                </label>
                <input
                  type="url"
                  value={newPaper.pdfUrl}
                  onChange={(e) => setNewPaper({ ...newPaper, pdfUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={newPaper.tags}
                onChange={(e) => setNewPaper({ ...newPaper, tags: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="machine learning, neural networks, AI"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Upload Paper
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Papers Grid */}
      <div className="space-y-4">
        {filteredPapers.map((paper) => (
          <div key={paper.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-2 text-lg">{paper.title}</h4>
                <p className="text-slate-600 text-sm mb-3 line-clamp-3">{paper.abstract}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md">
                    {paper.subject}
                  </span>
                  <span>{paper.year}</span>
                  {paper.authors.length > 0 && (
                    <span>By: {paper.authors.join(', ')}</span>
                  )}
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{paper.collaborators} collaborators</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {paper.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {paper.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              {paper.pdfUrl && (
                <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                  <Download size={14} />
                  Download PDF
                </button>
              )}
              
              {paper.doi && (
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors">
                  <ExternalLink size={14} />
                  View DOI
                </button>
              )}
              
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200 transition-colors">
                <Share2 size={14} />
                Share
              </button>
              
              <button
                onClick={() => onJoinCollaboration?.(paper.id)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users size={14} />
                Join Collaboration
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPapers.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No research papers found</p>
          <button
            onClick={() => setShowUploadForm(true)}
            className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Upload the first paper
          </button>
        </div>
      )}
    </div>
  );
};

export default ResearchPapers;
