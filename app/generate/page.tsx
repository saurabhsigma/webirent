'use client';

import { useState, useEffect } from 'react';
import { FiCode, FiPlay, FiSave } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function GenerateWebsite() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-website', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate website');
      }

      const data = await response.json();
      setGeneratedCode(data.code);
      
      // Create a blob URL for the preview
      const blob = new Blob([data.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      
      toast.success('Website generated successfully!');
    } catch (error) {
      console.error('Error generating website:', error);
      toast.error('Failed to generate website. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!generatedCode) {
      toast.error('No website to save');
      return;
    }

    const blob = new Blob([generatedCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Website saved successfully!');
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Generate Website</h1>

          <div className="glass-card p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1">
                  Describe your website
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="input-field w-full h-32"
                  placeholder="Describe the website you want to generate. For example: 'A modern landing page for a coffee shop with a hero section, menu, and contact form'"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {isGenerating ? (
                    'Generating...'
                  ) : (
                    <>
                      <FiCode className="mr-2" /> Generate Website
                    </>
                  )}
                </button>

                {generatedCode && (
                  <>
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="btn-secondary flex items-center justify-center"
                    >
                      <FiPlay className="mr-2" /> {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    <button
                      onClick={handleSave}
                      className="btn-secondary flex items-center justify-center"
                    >
                      <FiSave className="mr-2" /> Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {showPreview && previewUrl && (
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
              <div className="relative w-full h-[600px] border border-gray-700 rounded-lg overflow-hidden">
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="Generated Website Preview"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 