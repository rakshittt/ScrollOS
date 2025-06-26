import { NextResponse } from 'next/server';
import { cronJobs } from '@/lib/cron';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobName = searchParams.get('job');

    if (!jobName) {
      return new NextResponse('Job name is required', { status: 400 });
    }

    const job = cronJobs.find((j) => j.name === jobName);
    if (!job) {
      return new NextResponse('Job not found', { status: 404 });
    }

    await job.job();

    return new NextResponse('Job completed successfully', { status: 200 });
  } catch (error) {
    console.error('Error running cron job:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 