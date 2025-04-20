'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ExpenseChart from '@/components/ExpenseChart';
import Navbar from '@/components/Navbar'; // Import the Navbar component

// Define the interface for the expense items
interface Expense {
  fecha: string;
  descripcion: string;
  monto: number;
  proyecto: string;
  // Add any other properties your expenses table has
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('proyecto_gastos')
        .select('*')
        .order('fecha', { ascending: true });
      
      if (error) throw error;
      
      setExpenses(data || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to add test data
  const addTestData = async () => {
    setIsLoading(true);
    try {
      // Sample data generator
      const generateSampleData = () => {
        const projectNames = ['jalapeño1', 'tomate', 'berries', 'berries2'];
        const sampleExpenses: Expense[] = [];
        
        // Generate data for each month of 2025
        for (let month = 1; month <= 12; month++) {
          // Add expenses for each project
          for (const project of projectNames) {
            // Different expense patterns for each project
            let baseAmount = 1000;
            if (project === 'jalapeño1') baseAmount = 1500 + (month * 120);
            if (project === 'tomate') baseAmount = 2000 + (month * 80);
            if (project === 'berries') baseAmount = 1200 + (month * 150);
            if (project === 'berries2') baseAmount = 1800 + (month * 100);
            
            // Add 2-3 expenses per project per month
            for (let i = 0; i < 2 + (month % 2); i++) {
              const categories = ['Fertilizante', 'Agua', 'Semillas', 'Mano de obra', 'Transporte', 'Electricidad'];
              const category = categories[i % categories.length];
              
              // Vary amount slightly
              const variation = 0.8 + (i * 0.1);
              const amount = baseAmount * variation;
              
              sampleExpenses.push({
                fecha: new Date(2025, month - 1, 10 + i * 5).toISOString(),
                descripcion: category,
                monto: amount,
                proyecto: project,
              });
            }
          }
        }
        
        return sampleExpenses;
      };

      const testData = generateSampleData();
      
      // Insert in smaller batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < testData.length; i += batchSize) {
        const end = (i + batchSize < testData.length) ? i + batchSize : testData.length;
        const batch = testData.slice(i, end);
        
        const { error } = await supabase.from('proyecto_gastos').insert(batch);
        
        if (error) throw error;
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Reload data
      await fetchData();
      
    } catch (err: any) {
      console.error('Error adding test data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Add the Navbar at the top of the page */}
      <Navbar />
      
      <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gastos por Proyecto</h1>
            <div className="flex space-x-4">
              <button
                onClick={() => fetchData()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                disabled={isLoading}
              >
                {isLoading ? 'Cargando...' : 'Refrescar'}
              </button>
              <button
                onClick={addTestData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                {isLoading ? 'Cargando...' : 'Agregar Datos de Prueba'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
              Error: {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            expenses.length > 0 ? (
              <ExpenseChart expenses={expenses} />
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500 mb-4">No hay datos para mostrar. Usa el botón "Agregar Datos de Prueba" para generar datos.</p>
                <button
                  onClick={addTestData}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                >
                  Agregar Datos de Prueba
                </button>
              </div>
            )
          )}
        </div>
      </main>
    </>
  );
}