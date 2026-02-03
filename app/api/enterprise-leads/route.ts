import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const {
      companyName,
      contactName,
      contactEmail,
      contactPhone,
      estimatedSeats,
      message,
    } = await request.json();

    // Validation
    if (!companyName || !contactName || !contactEmail || !estimatedSeats) {
      return NextResponse.json(
        { error: 'Company name, contact name, email, and estimated seats are required' },
        { status: 400 }
      );
    }

    if (estimatedSeats < 50) {
      return NextResponse.json(
        { error: 'Enterprise leads are for 50+ seats. Please use regular signup for smaller teams.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create enterprise lead
    const { data: lead, error } = await supabase
      .from('enterprise_leads')
      .insert({
        company_name: companyName,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone || null,
        estimated_seats: estimatedSeats,
        message: message || null,
        status: 'new',
        source: 'pricing_page',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating enterprise lead:', error);
      return NextResponse.json(
        { error: 'Failed to submit enterprise inquiry' },
        { status: 500 }
      );
    }

    // TODO: Send email notification to super admin(s)
    // For now, log to console
    console.log('New enterprise lead created:', {
      id: lead.id,
      company: companyName,
      contact: contactName,
      email: contactEmail,
      seats: estimatedSeats,
    });

    // TODO: Send confirmation email to prospect
    // TODO: Create webhook/notification for sales team

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      message: 'Thank you for your interest! Our team will contact you within 24 hours.',
    });
  } catch (error) {
    console.error('Enterprise lead submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for super admins to view leads
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if super admin
    const { data: userData } = await supabase
      .from('users')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden - Super admin only' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Build query
    let query = supabase.from('enterprise_leads').select('*').order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: leads, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error fetching enterprise leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enterprise leads' },
      { status: 500 }
    );
  }
}
