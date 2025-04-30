"use client";

import { useChat } from "ai/react";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import { PublicJob } from "@/lib/types/coople";
import { JobProfile, fetchJobProfiles } from "@/lib/utils/job-profiles";

export function Jobs({
  jobs = [],
  chatId,
}: {
  jobs: PublicJob[];
  chatId?: string;
}) {
  const [jobProfiles, setJobProfiles] = useState<Map<number, JobProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  
  const { append } = useChat({
    id: chatId || "jobs",
    body: { id: chatId || "jobs" },
    maxSteps: 5,
  });

  useEffect(() => {
    const loadJobProfiles = async () => {
      setLoading(true);
      const profiles = await fetchJobProfiles();
      setJobProfiles(profiles);
      setLoading(false);
    };

    loadJobProfiles();
  }, []);

  const getJobProfileName = (profileId: number) => {
    const profile = jobProfiles.get(profileId);
    return profile ? profile.name : 'Unknown Profile';
  };

  return (
    <div className="rounded-lg bg-muted px-4 py-1.5 flex flex-col">
      {loading && (
        <div className="py-4 text-center text-muted-foreground">Loading job profiles...</div>
      )}
      {!loading && jobs.map((job) => (
        <div
          key={job.workAssignmentId}
          className="cursor-pointer flex flex-row border-b dark:border-zinc-700 py-2 last-of-type:border-none group"
          onClick={() => {
            if (chatId) {
              append({
                role: "user",
                content: `I'm interested in the ${job.workAssignmentName} job!`,
              });
            }
          }}
        >
          <div className="flex flex-col w-full gap-0.5 justify-between">
            <div className="flex flex-row gap-0.5 text-base sm:text-base font-medium group-hover:underline">
              <div className="text">{getJobProfileName(job.jobSkill.jobProfileId)}</div>
            </div>
            <div className="text w-fit hidden sm:flex text-sm text-muted-foreground flex-row gap-2 mt-1">
              <div>{job.jobLocation.city}, {job.jobLocation.zip}</div>
            </div>
            <div className="text sm:hidden text-xs sm:text-sm text-muted-foreground flex flex-row gap-2 mt-1">
              {job.jobLocation.city}
            </div>
          </div>

          <div className="flex flex-col w-28 gap-0.5 justify-between">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base">
                {format(new Date(job.periodFrom), "dd MMM")}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-row">
              <div>Start Date</div>
            </div>
          </div>

          <div className="flex flex-col w-36 items-end gap-0.5">
            <div className="flex flex-row gap-2">
              <div className="text-base sm:text-base text-emerald-600 dark:text-emerald-500">
                {job.hourlyWage.amount} CHF
              </div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground flex flex-row">
              Hourly Rate
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
