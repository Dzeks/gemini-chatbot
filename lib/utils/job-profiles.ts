export interface JobProfile {
  id: number;
  name: string;
  icon: string;
  description: string;
  active: boolean;
  educationalLevels: {
    id: number;
    name: string;
    description: string;
    active: boolean;
  }[];
  industryIds: number[];
}

export interface JobProfilesResponse {
  status: number;
  data: JobProfile[];
  errorCode: string;
  errorDetails: Record<string, any>;
  errorId: number;
  error: boolean;
}

export async function fetchJobProfiles(): Promise<Map<number, JobProfile>> {
  try {
    const response = await fetch('https://www.test.aws.coople.com/ch/resources/api/common/job-profiles');
    const data: JobProfilesResponse = await response.json();
    
    // Create a map of job profile IDs to job profiles
    const profilesMap = new Map<number, JobProfile>();
    
    if (data.status === 200 && Array.isArray(data.data)) {
      data.data.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });
    }
    
    return profilesMap;
  } catch (error) {
    console.error('Error fetching job profiles:', error);
    return new Map();
  }
} 