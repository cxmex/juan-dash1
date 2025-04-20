'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Project colors
const projectColors = {
  'jalapeño1': '#22c55e', // green-500
  'tomate': '#ef4444',    // red-500
  'berries': '#3b82f6',   // blue-500
  'berries2': '#a855f7',  // purple-500
  'total': '#000000',     // black
};

// Project names to track
const projectNames = ['jalapeño1', 'tomate', 'berries', 'berries2'];

export default function ExpenseChart({ expenses }) {
  const [selectedProjects, setSelectedProjects] = useState(new Set(projectNames));
  const [showTotal, setShowTotal] = useState(true);
  const [chartData, setChartData] = useState([]);

  // Process data when expenses change
  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const { monthlyData, hasData } = processExpenseData(expenses);
      if (hasData) {
        setChartData(monthlyData);
      }
    }
  }, [expenses]);

  // Function to process expense data for chart
  const processExpenseData = (expenses) => {
    // Maps to hold data for each project by month
    const gastosPorProyectoYMes = {};
    
    // Map for total expenses by month
    const gastosTotalesPorMes = {};
    
    // Initialize data structure
    for (const project of projectNames) {
      gastosPorProyectoYMes[project] = {};
    }
    
    // Group expenses by project and month
    for (const expense of expenses) {
      // Parse fecha as a date if it's a string
      const expenseDate = new Date(expense.fecha);
      const monthKey = format(expenseDate, 'yyyy-MM');
      const project = expense.proyecto;
      
      // Use default project if the one from data isn't in our list
      const validProject = projectNames.includes(project) ? project : projectNames[0];
      
      // Add expense to the appropriate project and month
      gastosPorProyectoYMes[validProject][monthKey] = 
          (gastosPorProyectoYMes[validProject][monthKey] || 0) + expense.monto;
      
      // Add to total expenses by month
      gastosTotalesPorMes[monthKey] = (gastosTotalesPorMes[monthKey] || 0) + expense.monto;
    }
    
    // Check if we have any data
    let hasData = false;
    for (const project of projectNames) {
      if (Object.keys(gastosPorProyectoYMes[project]).length > 0) {
        hasData = true;
        break;
      }
    }
    
    // Get all unique months from the data
    const allMonths = new Set();
    
    for (const project of projectNames) {
      Object.keys(gastosPorProyectoYMes[project]).forEach(month => allMonths.add(month));
    }
    
    // Sort months chronologically
    const sortedMonths = Array.from(allMonths).sort();
    
    // Prepare data for the chart
    const monthlyData = sortedMonths.map(monthKey => {
      const [year, month] = monthKey.split('-').map(part => parseInt(part, 10));
      const monthNames = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];
      
      const dataPoint = {
        name: monthNames[month - 1],
        monthKey
      };
      
      // Add data for each project
      for (const project of projectNames) {
        dataPoint[project] = gastosPorProyectoYMes[project][monthKey] || 0;
      }
      
      // Add total
      dataPoint.total = gastosTotalesPorMes[monthKey] || 0;
      
      return dataPoint;
    });
    
    return { monthlyData, hasData, gastosPorProyectoYMes, gastosTotalesPorMes };
  };

  // Toggle project selection
  const toggleProject = (project) => {
    setSelectedProjects(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(project)) {
        newSelection.delete(project);
      } else {
        newSelection.add(project);
      }
      return newSelection;
    });
  };

  // Toggle total line
  const toggleTotal = () => {
    setShowTotal(prev => !prev);
  };

  // Format tooltip values
  const formatTooltip = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  // Format Y axis values
  const formatYAxis = (value) => {
    return new Intl.NumberFormat('es-MX', {
      notation: 'compact',
      compactDisplay: 'short'
    }).format(value);
  };

  // Calculate total expenses
  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.monto, 0) || 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Gastos por Proyecto y Mes</h2>
        <p className="text-gray-700">
          Total: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalExpenses)}
        </p>
      </div>

      {/* Project selection */}
      <div className="flex flex-wrap gap-3 mb-6">
        {projectNames.map((project) => (
          <button
            key={project}
            onClick={() => toggleProject(project)}
            className={`flex items-center px-3 py-1.5 rounded-full border transition ${
              selectedProjects.has(project)
                ? 'bg-opacity-20 border-opacity-50'
                : 'bg-gray-100 border-gray-300'
            }`}
            style={{
              backgroundColor: selectedProjects.has(project) ? `${projectColors[project]}20` : undefined,
              borderColor: selectedProjects.has(project) ? projectColors[project] : undefined
            }}
          >
            <span 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: projectColors[project] }}
            ></span>
            <span className="text-sm font-medium">{project}</span>
            {selectedProjects.has(project) && (
              <svg className="ml-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </button>
        ))}
        
        {/* Total filter */}
        <button
          onClick={toggleTotal}
          className={`flex items-center px-3 py-1.5 rounded-full border transition ${
            showTotal
              ? 'bg-gray-200 border-gray-400'
              : 'bg-gray-100 border-gray-300'
          }`}
        >
          <span 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: '#000000' }}
          ></span>
          <span className="text-sm font-medium">Total</span>
          {showTotal && (
            <svg className="ml-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatYAxis} />
              <Tooltip formatter={formatTooltip} />
              
              {/* Project lines */}
              {Array.from(selectedProjects).map((project) => (
                <Line
                  key={project}
                  type="monotone"
                  dataKey={project}
                  stroke={projectColors[project]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={project}
                />
              ))}
              
              {/* Total line */}
              {showTotal && (
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#000000"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay datos para mostrar.</p>
        </div>
      )}
    </div>
  );
}