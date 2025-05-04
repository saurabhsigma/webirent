'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { FiZap, FiX } from 'react-icons/fi';

export default function PromptModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const generateCode = async (prompt: string): Promise<string> => {
    try {
      const response = await fetch('https://api.cohere.ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VITE_COHERE_API_KEY}`, // Make sure to define this in .env
        },
        body: JSON.stringify({
          model: 'command',
          prompt: `Generate a complete responsive website with HTML, CSS, and JavaScript based on this idea: ${prompt}`,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (data?.message) throw new Error(data.message);
      return data.generations?.[0]?.text || '/* Failed to generate code */';
    } catch (error) {
      console.error('Error generating code:', error);
      throw new Error('Error generating code');
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Open a new window immediately to mimic bolt.new
    const newWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!newWindow) {
      alert("Popup blocked. Please allow popups for this site.");
      return;
    }

    // Show a loading state in the new window
    newWindow.document.write(`
      <html>
        <head>
          <title>Generating Website...</title>
          <style>
            body { background: #0d0d0d; color: #00ff88; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh; }
            .loader { animation: pulse 1s infinite; font-size: 24px; }
            @keyframes pulse {
              0% { opacity: 0.2 }
              50% { opacity: 1 }
              100% { opacity: 0.2 }
            }
          </style>
        </head>
        <body><div class="loader">✨ Generating website...</div></body>
      </html>
    `);

    setLoading(true);
    setIsOpen(false);

    try {
      const code = await generateCode(prompt);

      // Replace content with generated code
      newWindow.document.open();
      newWindow.document.write(code);
      newWindow.document.close();
    } catch (error: any) {
      newWindow.document.body.innerHTML = `<pre style="color:red; padding:2rem;">Error generating code: ${error.message}</pre>`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition"
      >
        <FiZap className="mr-2" />
        Generate Website
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            leave="ease-in duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto flex items-center justify-center px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              leave="ease-in duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-bold text-white">
                    What do you want to build?
                  </Dialog.Title>
                  <button onClick={closeModal} className="text-gray-400 hover:text-white">
                    <FiX size={20} />
                  </button>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <input
                    type="text"
                    placeholder="e.g., Landing page for an eco startup"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />

                  <button
                    onClick={handleGenerate}
                    className={`mt-6 w-full py-3 rounded-lg font-semibold text-white transition ${
                      loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate Website'}
                  </button>
                </motion.div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
