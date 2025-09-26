import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hostname = searchParams.get('hostname');
    const port = searchParams.get('port');

    if (!hostname || !port) {
      return NextResponse.json(
        { error: 'Hostname ve port parametreleri gerekli' },
        { status: 400 }
      );
    }

    // External API'ye server-side istek yap
    const response = await axios.get(`https://mcapi.tr/api/status/${hostname}:${port}`, {
      timeout: 10000, // 10 saniye timeout
    });

    return NextResponse.json({
      online: response.data.players.online,
      version: response.data.version.name,
      roundTripLatency: response.data.roundTripLatency,
      favicon: response.data.favicon,
      motd: response.data.motd.html,
    });

  } catch (error) {
    console.error('Minecraft status API error:', error);
    
    // Hata durumunda varsayılan değerler döndür
    return NextResponse.json({
      online: 0,
      version: 'Bilinmiyor',
      roundTripLatency: 0,
      favicon: '',
      motd: 'Sunucu durumu alınamadı',
    });
  }
}
