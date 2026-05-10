import React, { useState } from 'react';
import { Plus, ExternalLink, Image as ImageIcon, Tag, Calendar, Share2, Linkedin } from 'lucide-react';
import { PortfolioItem } from '../types';

interface PortfolioProps {
  portfolioItems: PortfolioItem[];
  onAddItem?: (item: Omit<PortfolioItem, 'id' | 'userId' | 'createdAt'>) => void;
  isOwnPortfolio?: boolean;
}

const Portfolio: React.FC<PortfolioProps> = ({
  portfolioItems,
  onAddItem,
  isOwnPortfolio = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    link: '',
    tags: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim() || !newItem.description.trim()) return;

    onAddItem?.({
      title: newItem.title.trim(),
      description: newItem.description.trim(),
      category: newItem.category,
      link: newItem.link.trim(),
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    });

    setNewItem({ title: '', description: '', category: '', link: '', tags: '' });
    setShowAddForm(false);
  };

  const shareToLinkedIn = (item: PortfolioItem) => {
    const text = `Check out my ${item.category} project: ${item.title}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">Portfolio</h3>
        {isOwnPortfolio && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Add Project
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 mb-4">Add New Project</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="My Awesome Project"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="Describe your project..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Design">Design</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Research">Research</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Project Link
                </label>
                <input
                  type="url"
                  value={newItem.link}
                  onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={newItem.tags}
                onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add Project
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portfolioItems.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                  {item.category}
                </span>
              </div>
              <div className="flex gap-2">
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                <button
                  onClick={() => shareToLinkedIn(item)}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Share on LinkedIn"
                >
                  <Linkedin size={16} />
                </button>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4 line-clamp-3">
              {item.description}
            </p>

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {item.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md"
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar size={12} />
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {portfolioItems.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No projects in portfolio yet</p>
          {isOwnPortfolio && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add your first project
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
