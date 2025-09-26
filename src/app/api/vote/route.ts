import { NextRequest, NextResponse } from 'next/server';
import { voteService } from '@/lib/api/services/voteService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId } = body;

    if (!providerId) {
      return NextResponse.json(
        { 
          status: false, 
          message: 'Provider ID gerekli' 
        },
        { status: 400 }
      );
    }

    const result = await voteService.sendVote({ providerId });

    // Vote başarılıysa kullanıcı bilgilerini yenile
    if (result.success) {
      // Client-side'da kullanıcı bilgilerini yenilemek için reloadUser çağrılacak
      return NextResponse.json({
        ...result,
        reloadUser: true
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Vote API error:', error);
    
    return NextResponse.json(
      { 
        status: false, 
        message: error.message || 'Oy gönderilirken bir hata oluştu' 
      },
      { status: 500 }
    );
  }
}
