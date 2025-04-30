# Coople Job Listings Feature Implementation Plan

## Overview
Add a new tool to the chat API that fetches recent job listings from the Coople API and displays them to users. This will enable users to request and view the most recent job opportunities with a simple prompt.

## Requirements
- Add a new `searchJobs` tool to the chat API
- Create a React component to display job listings similar to the existing Weather component
- Handle user queries related to job listings (e.g., "show me the most recent 5 jobs")

## Implementation Tasks
- [ ] Create interfaces for Coople API request/response
- [ ] Implement the `searchJobs` tool in the API route
- [ ] Create a `Jobs` component to display job listings
- [ ] Add tool validation and error handling
- [ ] Update Message component to render Jobs results

## Detailed Implementation Plan

### 1. Create Interfaces for Coople API
We need to define TypeScript interfaces for the Coople API request and response structure.

```typescript
// lib/types/coople.ts
export interface PublicJob {
  workAssignmentId: string;
  waReadableId: string;
  hourlyWage: {
    amount: number;
    currencyId: number;
  };
  salary: { 
    amount: number; 
    currencyId: number 
  };
  hourlyWageWithHolidayPay?: { 
    amount: number; 
    currencyId: number 
  };
  salaryWithHolidayPay?: { 
    amount: number; 
    currencyId: number 
  };
  jobSkill: {
    jobProfileId: number;
    educationalLevelId: number;
  };
  workAssignmentName: string;
  jobLocation: {
    addressStreet: string;
    extraAddress: string;
    zip: string;
    city: string;
    state: string;
    countryId: number;
  };
  periodFrom: number;
  datePublished: number;
  branchLink?: string;
}

export interface CoopleJobsResponse {
  status: number;
  data: {
    items: PublicJob[];
    total: number;
  };
  errorCode: string;
  errorDetails: Record<string, any>;
  errorId: number;
  error: boolean;
}

export interface CoopleJobsRequest {
  pageNum: number;
  pageSize: number;
}
```

### 2. Add the `searchJobs` Tool to route.ts
We need to add a new tool to the existing API route that handles chat functionality.

```typescript
// Addition to app/(chat)/api/chat/route.ts
searchJobs: {
  description: "Search for job listings from Coople",
  parameters: z.object({
    pageSize: z.number().optional().describe("Number of job listings to return"),
  }),
  execute: async ({ pageSize = 5 }) => {
    try {
      const response = await fetch(
        `https://www.coople.com/ch/resources/api/work-assignments/public-jobs/list?pageNum=0&pageSize=${pageSize}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const jobsData = await response.json();
      return jobsData;
    } catch (error) {
      console.error("Error fetching job listings:", error);
      return { error: "Failed to fetch job listings." };
    }
  },
},
```

### 3. Create Jobs Component
Based on the existing Weather component, we need to create a new component for displaying job listings.

```typescript
// components/custom/jobs.tsx
"use client";

import cx from "classnames";
import { format } from "date-fns";
import { PublicJob } from "@/lib/types/coople";

interface JobsProps {
  jobs?: Array<PublicJob>;
}

export function Jobs({ jobs = [] }: JobsProps) {
  if (!jobs || jobs.length === 0) {
    // Loading/empty state
    return (
      <div className="flex flex-col gap-4 skeleton">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="rounded-2xl p-4 h-32 skeleton-bg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {jobs.map((job) => (
        <div
          key={job.workAssignmentId}
          className="rounded-2xl p-4 bg-blue-50 shadow-sm border border-blue-100"
        >
          <div className="flex flex-col gap-2">
            <div className="text-xl font-medium text-blue-900">
              {job.workAssignmentName}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-blue-700 font-medium">
                {job.hourlyWage.amount} CHF/h
              </div>
              <div className="text-blue-600">
                {job.jobLocation.city}, {job.jobLocation.zip}
              </div>
            </div>
            
            <div className="text-sm text-blue-500">
              Starting: {format(new Date(job.periodFrom), "dd MMM yyyy")}
            </div>
            
            {job.branchLink && (
              <a 
                href={job.branchLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View details
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Update Message Component
We need to update the Message component to render the Jobs component when the `searchJobs` tool is used, following the same pattern used for other tools.

```typescript
// components/custom/message.tsx
// Add import at the top of the file
import { Jobs } from "./jobs";

// Find the conditional rendering section for tool invocations and add a new case
// for searchJobs - This will look similar to how Weather and other tools are rendered

// Existing code:
{toolInvocations && (
  <div className="flex flex-col gap-4">
    {toolInvocations.map((toolInvocation) => {
      const { toolName, toolCallId, state } = toolInvocation;

      if (state === "result") {
        const { result } = toolInvocation;

        return (
          <div key={toolCallId}>
            {toolName === "getWeather" ? (
              <Weather weatherAtLocation={result} />
            ) : toolName === "displayFlightStatus" ? (
              <FlightStatus flightStatus={result} />
            ) 
            // ... other tool conditions
            : toolName === "verifyPayment" ? (
              <VerifyPayment result={result} />
            ) 
            // Add the new condition for searchJobs here:
            : toolName === "searchJobs" ? (
              result.error ? (
                <div className="text-red-500">Error fetching jobs: {result.error}</div>
              ) : (
                <Jobs jobs={result.data?.items} />
              )
            ) : (
              <div>{JSON.stringify(result, null, 2)}</div>
            )}
          </div>
        );
      } else {
        // Also add condition for the loading state
        return (
          <div key={toolCallId} className="skeleton">
            {toolName === "getWeather" ? (
              <Weather />
            )
            // ... other tool loading states
            : toolName === "searchJobs" ? (
              <Jobs />
            ) : null}
          </div>
        );
      }
    })}
  </div>
)}
```

### 5. Modify the Chat System Prompt
We need to update the system prompt to tell the AI about the new job listing capabilities:

```typescript
// Update in app/(chat)/api/chat/route.ts
system: `\n
  - you help users book flights!
  - keep your responses limited to a sentence.
  - DO NOT output lists.
  - after every tool call, pretend you're showing the result to the user and keep your response limited to a phrase.
  - today's date is ${new Date().toLocaleDateString()}.
  - ask follow up questions to nudge user into the optimal flow
  - ask for any details you don't know, like name of passenger, etc.'
  - C and D are aisle seats, A and F are window seats, B and E are middle seats
  - assume the most popular airports for the origin and destination
  - You can also help users find jobs! If they ask about jobs or job listings, use searchJobs tool.
  - here's the optimal flow
    - search for flights
    - suggest to work a bit there and search for the 5 recent jobs in that location
    - choose flight
    - select seats
    - create reservation (ask user whether to proceed with payment or change reservation)
    - authorize payment (requires user consent, wait for user to finish payment and let you know when done)
    - display boarding pass (DO NOT display boarding pass without verifying payment)
  '
`,
```

## Testing Plan
1. Verify that the Coople API integration works correctly
2. Ensure job listings are properly displayed in the UI
3. Test with various user queries like "show me jobs" or "show me 3 latest jobs"
4. Verify error handling (API down, invalid parameters, etc.)
5. Test loading states and transitions between states

## Future Enhancements
- Add support for filtering jobs by location, job type, etc.
- Integrate with additional job lookup APIs
- Improve job card UI with more details and better formatting
- Add pagination support for browsing more job listings 