import connectDB from '@/lib/db';
import Template from '@/models/Template';
import TemplateDetailsClient from './TemplateDetailsClient';

type TemplateType = {
  _id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl: string;
  demoUrl: string;
  price: number;
  features: string[];
  isPopular: boolean;
};

export async function generateStaticParams() {
  await connectDB();
  const templates = await Template.find({}, '_id').lean() as TemplateType[];
  return templates.map((template) => ({
    id: template._id.toString(),
  }));
}

export default async function TemplateDetails({ params }: { params: { id: string } }) {
  await connectDB();
  const template = await Template.findById(params.id).lean() as TemplateType;
  
  if (!template) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Template not found</h2>
          <a href="/templates" className="btn-primary">
            Browse Templates
          </a>
        </div>
      </div>
    );
  }

  return <TemplateDetailsClient template={template} />;
}