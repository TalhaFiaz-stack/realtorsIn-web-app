import type {
  OffPlanProjectDetail,
  OffPlanSalesAgency,
} from "@/features/off-plan/types/off-plan.types";

function appendDeveloperQueryParams(
  params: URLSearchParams,
  input: {
    name?: string | null;
    image?: string | null;
    description?: string | null;
    email?: string | null;
    website?: string | null;
    address?: string | null;
    workingTime?: string | null;
    type?: string | null;
  }
) {
  if (input.name) params.set("name", input.name);
  if (input.image) params.set("image", input.image);
  if (input.description) {
    params.set("description", input.description.slice(0, 2000));
  }
  if (input.email) params.set("email", input.email);
  if (input.website) params.set("website", input.website);
  if (input.address) params.set("address", input.address);
  if (input.workingTime) params.set("workingTime", input.workingTime);
  if (input.type && input.type !== "null") params.set("type", input.type);
}

export function buildOffPlanDeveloperHref(
  project: Pick<
    OffPlanProjectDetail,
    | "developerId"
    | "developerName"
    | "developerImage"
    | "developerDescription"
    | "developerEmail"
    | "developerWebsite"
    | "developerAddress"
    | "developerWorkingTime"
    | "propertyTypes"
  >
): string | null {
  if (project.developerId == null) return null;
  const params = new URLSearchParams();
  appendDeveloperQueryParams(params, {
    name: project.developerName,
    image: project.developerImage,
    description: project.developerDescription,
    email: project.developerEmail,
    website: project.developerWebsite,
    address: project.developerAddress,
    workingTime: project.developerWorkingTime,
    type: project.propertyTypes,
  });
  const qs = params.toString();
  return `/off-plan/developer/${project.developerId}${qs ? `?${qs}` : ""}`;
}

export function buildOffPlanSalesAgencyHref(
  agency: OffPlanSalesAgency
): string | null {
  const developerId = Number(agency.id);
  if (!Number.isFinite(developerId) || developerId <= 0) return null;
  const params = new URLSearchParams();
  const workingTime =
    agency.workingHours.length > 0
      ? agency.workingHours.map((w) => `${w.day}: ${w.time}`).join("\n")
      : null;
  appendDeveloperQueryParams(params, {
    name: agency.name,
    image: agency.image,
    description: agency.description,
    email: agency.email,
    website: agency.website,
    address: agency.address,
    workingTime,
    type: agency.type,
  });
  const qs = params.toString();
  return `/off-plan/developer/${developerId}${qs ? `?${qs}` : ""}`;
}
