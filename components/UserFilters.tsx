import React, { useState } from 'react';
import { Filter, Search, X, Users, GraduationCap, Building } from 'lucide-react';

interface UserFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    department: string;
    year: number | null;
    skills: string[];
  }) => void;
}

function yearOrdinal(y: number): string {
  if (y === 1) return '1st';
  if (y === 2) return '2nd';
  if (y === 3) return '3rd';
  return y + 'th';
}

const UserFilters: React.FC<UserFiltersProps> = ({ onFiltersChange }) => {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState<number | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Business Administration',
    'Economics',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'Other'
  ];

  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js',
    'Machine Learning', 'Data Science', 'UI/UX Design',
    'Mobile Development', 'Cloud Computing', 'DevOps',
    'Blockchain', 'Game Development', 'IoT', 'AR/VR',
    'Web Development', 'Database Management', 'Cybersecurity',
    'Graphic Design', 'Video Editing', 'Content Writing',
    'Public Speaking', 'Leadership', 'Project Management'
  ];

  const years = [1, 2, 3, 4, 5];

  React.useEffect(() => {
    onFiltersChange({
      search,
      department,
      year,
      skills: selectedSkills
    });
  }, [search, department, year, selectedSkills, onFiltersChange]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setDepartment('');
    setYear(null);
    setSelectedSkills([]);
  };

  const hasActiveFilters = search || department || year || selectedSkills.length > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Filter Students</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Search by Name or Email
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Department Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Building className="inline w-4 h-4 mr-1" />
          Department
        </label>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Year Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <GraduationCap className="inline w-4 h-4 mr-1" />
          Year of Study
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setYear(null)}
            className={
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors " +
              (year === null
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
            }
          >
            All Years
          </button>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors " +
                (year === y
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
              }
            >
              {yearOrdinal(y)} Year
            </button>
          ))}
        </div>
      </div>

      {/* Skills Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Users className="inline w-4 h-4 mr-1" />
          Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {commonSkills.map(skill => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors " +
                (selectedSkills.includes(skill)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
              }
            >
              {skill}
            </button>
          ))}
        </div>
        {selectedSkills.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-600 mb-2">Selected skills:</p>
            <div className="flex flex-wrap gap-1">
              {selectedSkills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-md"
                >
                  {skill}
                  <button
                    onClick={() => toggleSkill(skill)}
                    className="hover:text-indigo-900"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-sm font-medium text-slate-700 mb-2">Active Filters:</p>
          <div className="space-y-1 text-xs text-slate-600">
            {search && (
              <p>
                • Search: &quot;{search}&quot;
              </p>
            )}
            {department && <p>• Department: {department}</p>}
            {year && <p>• Year: {yearOrdinal(year)} Year</p>}
            {selectedSkills.length > 0 && <p>• Skills: {selectedSkills.join(', ')}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserFilters;
