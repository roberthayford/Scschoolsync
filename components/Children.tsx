import React from 'react';
import { Child } from '../types';
import { Plus, Edit2, Trash2, Mail, School } from 'lucide-react';

interface ChildrenProps {
  childrenList: Child[];
}

const Children: React.FC<ChildrenProps> = ({ childrenList }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Children & Profiles</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Plus size={18} />
          <span>Add Child</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {childrenList.map((child) => (
          <div key={child.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
            <div className={`h-24 bg-${child.color}-100 flex items-center justify-center`}>
              <div className={`w-20 h-20 bg-${child.color}-200 rounded-full flex items-center justify-center border-4 border-white shadow-sm mt-10`}>
                 <span className={`text-2xl font-bold text-${child.color}-600`}>{child.name[0]}</span>
              </div>
            </div>
            
            <div className="pt-12 p-6 text-center">
              <h3 className="text-xl font-bold text-slate-900">{child.name}</h3>
              <p className="text-slate-500 font-medium flex items-center justify-center gap-1.5 mt-1">
                <School size={14} />
                {child.schoolName}
              </p>

              <div className="mt-6 space-y-3 text-left">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Configuration</div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <Mail size={16} className="text-slate-400 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-slate-700">Email Patterns</p>
                        <p className="text-xs text-slate-500 mt-0.5">@{child.schoolName.split(' ')[0].toLowerCase()}.sch.uk</p>
                    </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between">
                <button className="text-slate-500 hover:text-indigo-600 text-sm font-medium flex items-center gap-1 transition-colors">
                    <Edit2 size={14} /> Edit
                </button>
                <button className="text-slate-500 hover:text-red-600 text-sm font-medium flex items-center gap-1 transition-colors">
                    <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-50 transition-all min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Plus size={32} />
            </div>
            <span className="font-semibold">Add another child</span>
        </button>
      </div>
    </div>
  );
};

export default Children;