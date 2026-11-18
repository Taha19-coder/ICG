import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const inquirySchema = z.object({
  name: z.string().trim().min(2).max(150),
  phone: z.string().trim().min(10).max(40),
  email: z.string().trim().email().max(254),
  inquiry_type: z.enum(['buying', 'renting', 'selling', 'construction', 'investment', 'general']),
  message: z.string().trim().min(20).max(5000),
  property_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ message: 'Inquiry submission is temporarily unavailable.' }, { status: 503 });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Please provide valid inquiry details.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await supabase.from('inquiries').insert({
      ...parsed.data,
      property_id: parsed.data.property_id || null,
      project_id: parsed.data.project_id || null,
      status: 'new',
    });

    if (error) {
      console.error('Unable to save public inquiry.', error.message);
      return NextResponse.json(
        { message: 'Failed to save inquiry. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Inquiry submitted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Inquiry submission API failed.', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}