import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { match_id, stars, comment } = await request.json();

    // Validate input
    if (!match_id || typeof match_id !== 'string') {
      return NextResponse.json(
        { error: 'match_id is required and must be a string' },
        { status: 400 }
      );
    }

    if (!stars || typeof stars !== 'number' || stars < 1 || stars > 5) {
      return NextResponse.json(
        { error: 'stars must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    // Insert rating into database
    const { data: rating, error } = await db
      .from('ratings')
      .insert({
        match_id,
        stars,
        comment: comment || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving rating:', error);
      return NextResponse.json(
        { error: 'Failed to save rating', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        rating_id: rating.id,
        message: 'Rating saved successfully'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in /api/rate:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process rating',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 