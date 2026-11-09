import type {
  OffPlanResaleUnit,
  OffPlanAttachment,
  OffPlanFacility,
  OffPlanDistrict,
  OffPlanInventoryUnit,
  OffPlanProjectDetail,
  OffPlanProjectSummary,
  OffPlanProjectsPage,
  OffPlanSalesExecutive,
  OffPlanTypicalUnit,
} from "@/features/off-plan/types/off-plan.types";
import {
  asBool,
  asNumber,
  asProjectId,
  asRecord,
  asString,
  parseLatLng,
  pickBannerImage,
} from "@/features/off-plan/lib/off-plan-parse";
import {
  parseDistrictPolygon,
  readProjectDistrictName,
} from "@/features/off-plan/lib/off-plan-district-polygons";

function parseTotalProperties(raw: unknown): number | null {
  const n = asNumber(raw);
  if (n != null && n > 0) return n;
  if (typeof raw === "string" && raw.trim()) {
    const parsed = Number(raw.trim());
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

export function mapOffPlanProjectSummary(
  raw: unknown
): OffPlanProjectSummary | null {
  const row = asRecord(raw);
  if (!row) return null;
  const id = asProjectId(row.id) ?? asProjectId(row.sorted_id);
  if (!id) return null;
  const coords = parseLatLng(row.lat_lng ?? row.latlong);
  return {
    id,
    title: asString(row.title) ?? asString(row.name) ?? "Project",
    developerName: asString(row.developer_name),
    developerImage: asString(row.developer_image),
    districtName: readProjectDistrictName(row),
    location:
      asString(row.project_location) ??
      asString(row.location) ??
      asString(row.district_name),
    priceStart: asNumber(row.price_start),
    priceEnd: asNumber(row.price_end),
    currency: asString(row.currency) ?? "AED",
    completionDate: asString(row.expected_completion_date),
    projectStatus: asString(row.project_status),
    completionStatusName: asString(row.completion_status_name),
    projectCompleted: asBool(row.project_completed),
    totalProperties: parseTotalProperties(row.total_properties),
    bannerImage: pickBannerImage(row),
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    commissionPercentage: asNumber(row.commission_percentage),
  };
}

export function mapOffPlanProjectsPage(payload: unknown): OffPlanProjectsPage {
  const root = asRecord(payload);
  if (!root) {
    return { projects: [], currentPage: 1, lastPage: 1, hasMore: false };
  }

  let list: unknown[] = [];
  let currentPage = asNumber(root.current_page) ?? 1;
  let lastPage = asNumber(root.last_page) ?? currentPage;

  const nested = root.data;
  if (Array.isArray(nested)) {
    list = nested;
  } else {
    const data = asRecord(nested) ?? root;
    list = Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.projects)
        ? data.projects
        : [];
    currentPage = asNumber(data.current_page) ?? currentPage;
    lastPage = asNumber(data.last_page) ?? lastPage;
  }

  const projects = list
    .map(mapOffPlanProjectSummary)
    .filter((p): p is OffPlanProjectSummary => Boolean(p));

  return {
    projects,
    currentPage,
    lastPage,
    hasMore: currentPage < lastPage,
  };
}

export function mapOffPlanProjectDetail(raw: unknown): OffPlanProjectDetail | null {
  const row = asRecord(raw);
  if (!row) return null;
  const base = mapOffPlanProjectSummary(row);
  if (!base) return null;

  const typicalRaw = row.typical_units;
  const typicalUnits: OffPlanTypicalUnit[] = Array.isArray(typicalRaw)
    ? typicalRaw.map((item, index) => {
        const u = asRecord(item) ?? {};
        const imageRaw = u.images;
        const image =
          Array.isArray(imageRaw) && imageRaw.length > 0
            ? typeof imageRaw[0] === "string"
              ? imageRaw[0]
              : asString(asRecord(imageRaw[0])?.url)
            : null;
        return {
          id: asProjectId(u.id) ?? `unit-${index}`,
          title:
            asString(u.title) ??
            asString(u.unit_type) ??
            "Unit",
          beds:
            asString(u.beds) ??
            asString(u.bedrooms) ??
            asString(u.bedroom),
          area:
            asString(u.area) ??
            asString(u.area_start) ??
            asString(u.lowest_area),
          priceStart:
            asString(u.price_start) ??
            asString(u.lowest_price) ??
            asString(u.price),
          priceEnd:
            asString(u.price_end) ??
            asString(u.highest_price),
          currency: asString(u.currency) ?? asString(u.display_currency),
          image,
        };
      })
    : [];

  const attachmentsRaw = row.attachments;
  const attachments: OffPlanAttachment[] = Array.isArray(attachmentsRaw)
    ? attachmentsRaw.map((item, index) => {
        const a = asRecord(item) ?? {};
        return {
          id: asNumber(a.id) ?? index,
          title:
            asString(a.attachment_title) ??
            asString(a.title) ??
            "Attachment",
          url:
            asString(a.attachment_url) ??
            asString(a.url) ??
            asString(a.file_url),
          fileType: asString(a.file_type),
        };
      })
    : [];

  const salesRaw = row.sales_executives;
  const salesExecutives: OffPlanSalesExecutive[] = Array.isArray(salesRaw)
    ? salesRaw
        .map((item) => {
          const s = asRecord(item);
          if (!s) return null;
          const id = asProjectId(s.id);
          if (!id) return null;
          return {
            id,
            name: asString(s.name) ?? "Sales executive",
            role: asString(s.role),
            phone: asString(s.phone),
            email: asString(s.email),
            image: asString(s.image),
            message: asString(s.message),
            useWhatsappBusinessApi: asBool(s.useWhatsappBusinessApi),
            companyWhatsappUrl: asString(s.companyWhatsappUrl),
          };
        })
        .filter((s): s is OffPlanSalesExecutive => Boolean(s))
    : [];

  const nearbyRaw = row.nearby_locations;
  const nearbyLocations = Array.isArray(nearbyRaw)
    ? nearbyRaw.map((item) => {
        const n = asRecord(item) ?? {};
        return {
          name: asString(n.name) ?? asString(n.title) ?? "Place",
          distance: asString(n.distance) ?? "",
        };
      })
    : [];

  const allImages = Array.isArray(row.all_images)
    ? row.all_images.filter((i): i is string => typeof i === "string")
    : [];

  const imagesObj = asRecord(row.images);
  const generalRaw = imagesObj?.general;
  const generalPlanImages = Array.isArray(generalRaw)
    ? generalRaw.filter((i): i is string => typeof i === "string")
    : [];

  const youtubeLinks = Array.isArray(row.youtube_links)
    ? row.youtube_links.filter((i): i is string => typeof i === "string")
    : [];

  const websiteObj = Array.isArray(row.website)
    ? asRecord(row.website[0])
    : asRecord(row.website);

  const amenitiesBlock = asRecord(row.amenities_and_features);
  const amenityLabels: string[] = [];
  const amenitiesRaw = amenitiesBlock?.amenities;
  const featuresRaw = amenitiesBlock?.features_names;
  if (Array.isArray(amenitiesRaw)) {
    amenitiesRaw.forEach((item) => {
      const label = asString(item) ?? asString(asRecord(item)?.name);
      if (label) amenityLabels.push(label);
    });
  }
  if (Array.isArray(featuresRaw)) {
    featuresRaw.forEach((item) => {
      const label = asString(item) ?? asString(asRecord(item)?.name);
      if (label) amenityLabels.push(label);
    });
  }

  const facilities: string[] = [];
  const facilityItems: OffPlanFacility[] = [];
  if (Array.isArray(row.facilities)) {
    row.facilities.forEach((item, index) => {
      const label = asString(item) ?? asString(asRecord(item)?.name);
      if (label) facilities.push(label);
      const f = asRecord(item);
      if (!f) return;
      const name = asString(f.name) ?? label;
      if (!name) return;
      facilityItems.push({
        id: asProjectId(f.id) ?? `facility-${index}`,
        name,
        image: asString(f.image),
        description: asString(f.description),
      });
    });
  }

  const buildingsRaw = row.buildings;
  const buildings = Array.isArray(buildingsRaw)
    ? buildingsRaw
        .map((item, index) => {
          const b = asRecord(item);
          if (!b) return null;
          const id = asProjectId(b.id) ?? `building-${index}`;
          const title = asString(b.title) ?? asString(b.name);
          if (!title) return null;
          return {
            id,
            title,
            image: asString(b.image) ?? asString(b.banner),
            totalProperties: asNumber(b.total_properties),
          };
        })
        .filter((b): b is NonNullable<typeof b> => Boolean(b))
    : [];

  const agenciesRaw = row.developers_data;
  const salesAgencies = Array.isArray(agenciesRaw)
    ? agenciesRaw
        .map((item, index) => {
          const a = asRecord(item);
          if (!a) return null;
          const name = asString(a.name) ?? asString(a.title);
          if (!name) return null;
          const workingRaw = asRecord(a.working_time);
          const workingHours: { day: string; time: string }[] = [];
          if (workingRaw) {
            Object.entries(workingRaw).forEach(([day, time]) => {
              const t = asString(time);
              if (t && t !== "null") workingHours.push({ day, time: t });
            });
          }
          return {
            id: asProjectId(a.id) ?? `agency-${index}`,
            name,
            image: asString(a.image) ?? asString(a.logo),
            type: asString(a.type),
            description: asString(a.description),
            email: asString(a.email),
            website: asString(a.website),
            address: asString(a.address),
            workingHours,
          };
        })
        .filter((a): a is NonNullable<typeof a> => Boolean(a))
    : [];

  const paymentPlansJson = row.new_payment_plans ?? row.payment_plans_json;
  const parkingJson = row.parking_json;
  const brokerInfoJson = row.broker_info_json;
  const inventoryJson = row.inventory_json;

  return {
    ...base,
    description: asString(row.description),
    propertyTypes: asString(row.types),
    formatUpdatedAt: asString(row.format_updated_at),
    projectCompleted: asBool(row.project_completed),
    address: asString(row.location) ?? base.location,
    latLong:
      asString(row.latlong) ??
      asString(row.lat_lng) ??
      (base.lat != null && base.lng != null
        ? `${base.lat},${base.lng}`
        : null),
    website: asString(websiteObj?.website_url) ?? asString(row.website),
    developerEmail: asString(row.developer_email),
    developerId: asNumber(row.developer_id),
    developerName: base.developerName ?? asString(row.developer_name),
    developerImage: asString(row.developer_image),
    developerWebsite: asString(row.developer_website),
    developerDescription: asString(row.developer_description),
    developerAddress: asString(row.developer_address),
    developerWorkingTime: asString(row.developer_working_time),
    images: allImages,
    generalPlanImages,
    hasProperty: asBool(row.has_property),
    pdfUrl: asString(row.pdf_url),
    offerLink: asString(row.offer_link),
    typicalUnits,
    buildings,
    facilities,
    facilityItems,
    amenityLabels,
    attachments,
    youtubeLinks,
    nearbyLocations,
    salesExecutives,
    salesAgencies,
    resaleUnitsCount: Array.isArray(row.resale_units)
      ? row.resale_units.length
      : 0,
    resaleUnits: mapOffPlanResaleUnits(row.resale_units),
    hasPaymentPlans: Array.isArray(paymentPlansJson)
      ? paymentPlansJson.length > 0
      : Boolean(paymentPlansJson),
    hasParking: Array.isArray(parkingJson) && parkingJson.length > 0,
    hasBrokerInfo: Array.isArray(brokerInfoJson) && brokerInfoJson.length > 0,
    hasInventoryOverview:
      Array.isArray(inventoryJson) && inventoryJson.length > 0,
    paymentPlansJson: paymentPlansJson ?? null,
    parkingJson: parkingJson ?? null,
    brokerInfoJson: brokerInfoJson ?? null,
    inventoryJson: inventoryJson ?? null,
  };
}

export function mapOffPlanDistricts(payload: unknown): OffPlanDistrict[] {
  const root = asRecord(payload);
  const list = Array.isArray(root?.data)
    ? root.data
    : Array.isArray(payload)
      ? payload
      : [];
  return list
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      const id = asProjectId(row.id);
      const title = asString(row.title) ?? asString(row.label);
      if (!id || !title) return null;
      const polygon = parseDistrictPolygon(row);
      const cityId =
        asProjectId(row.city_id) ?? asProjectId(row.cityId) ?? null;
      return {
        id,
        title,
        cityId,
        cityName: asString(row.city_name) ?? asString(row.cityName),
        polygon,
      };
    })
    .filter((d): d is OffPlanDistrict => Boolean(d));
}

export function flattenInventoryFloors(
  payload: unknown
): OffPlanInventoryUnit[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  if (!data) return [];

  const floors = data.floors;
  if (floors && typeof floors === "object" && !Array.isArray(floors)) {
    const units: OffPlanInventoryUnit[] = [];
    Object.entries(floors as Record<string, unknown>).forEach(
      ([floorKey, floorUnits]) => {
        if (!Array.isArray(floorUnits)) return;
        floorUnits.forEach((item) => {
          const u = asRecord(item);
          if (!u) return;
          const id = asProjectId(u.id);
          if (!id) return;
          const saleTypeRaw = u.sale_type ?? u.saleType;
          const saleTypeNum =
            typeof saleTypeRaw === "number" && Number.isFinite(saleTypeRaw)
              ? saleTypeRaw
              : typeof saleTypeRaw === "string" &&
                  saleTypeRaw.trim() !== "" &&
                  !Number.isNaN(Number(saleTypeRaw))
                ? Number(saleTypeRaw)
                : null;
          const statusLabel =
            asString(u.status) ??
            asString(u.sale_type_label) ??
            asString(u.saleTypeLabel);
          units.push({
            id,
            title: asString(u.title) ?? asString(u.number) ?? `#${id}`,
            priceStart: asNumber(u.price_start ?? u.priceStart),
            priceSqft: asNumber(u.price_sqft ?? u.priceSqft),
            areaStart: asNumber(u.area_start ?? u.areaStart),
            beds: asString(u.beds) ?? asString(u.bedrooms),
            status: statusLabel,
            saleTypeCode: saleTypeNum,
            unitType: asString(u.unit_type) ?? asString(u.unitType),
            floorKey,
            currency: asString(u.currency),
          });
        });
      }
    );
    return units;
  }
  return [];
}

export function mapOffPlanResaleUnits(raw: unknown): OffPlanResaleUnit[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): OffPlanResaleUnit | null => {
      const row = asRecord(item);
      const id = asNumber(row?.id);
      if (!row || id == null) return null;
      const positive = (v: unknown) => {
        const n = asNumber(v);
        return n != null && n > 0 ? n : null;
      };
      return {
        id,
        title: asString(row.title) ?? `Unit ${id}`,
        bedrooms: asString(row.bedrooms),
        baths: asString(row.baths),
        areaStart: positive(row.area_start),
        areaEnd: positive(row.area_end),
        priceStart: positive(row.price_start),
        priceEnd: positive(row.price_end),
        currency: asString(row.currency),
        paymentPlan: asString(row.payment_plan),
      };
    })
    .filter((u): u is OffPlanResaleUnit => u != null);
}
