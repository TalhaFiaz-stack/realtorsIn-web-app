import { describe, expect, it } from "vitest";
import {
  formatProfileDateRange,
  mapSkillsList,
  mapSocialProfile,
} from "@/features/profile/lib/map-profile";

describe("mapSocialProfile", () => {
  it("maps own social profile payload", () => {
    const profile = mapSocialProfile(
      {
        status: true,
        data: {
          id: 92,
          user_id: 92,
          rem_user_id: 3712,
          name: "Talha",
          last_name: "Fiaz",
          full_name: "Talha Fiaz",
          user_name: "talha",
          description: "Advisor",
          location: "Dubai",
          company: "REM",
          user_role: "Agent",
          show_role: 1,
          show_company: 1,
          is_verified: true,
          open_to: "1",
          posts_count: 4,
          all_likes_count: 2,
          connections_count: 44,
          profile_image: { url: "https://cdn.example/a.jpg" },
          cover_image: { url: "https://cdn.example/c.jpg" },
          about: {
            id: 9,
            about_text: "Hello about",
            top_skills_ids: ["1", "2"],
          },
          positions: [
            {
              id: 1,
              title: "Agent",
              company: "REM",
              start_date: "2024-01-01",
              is_currently_working: true,
            },
          ],
          educations: [
            {
              id: 2,
              degree: "BBA",
              school: "UOS",
              field_of_study: "Marketing",
              start_date: "2016-09-01",
              end_date: "2020-06-30",
            },
          ],
          certificates: [],
          analytics: {
            analytics: {
              post_impressions: { value: 2 },
              profile_viewers: { value: 5 },
              search_appearances: { value: 1 },
              connections: { value: 3 },
            },
          },
          cv_link: "https://api.example/cv/92",
          broker_card_verified: true,
          broker_card_status: { status: "approved" },
          has_connector_badge: true,
          has_influencer_badge: false,
          resume_templates: [
            {
              id: "resume",
              name: "Classic Resume",
              url: "https://realtorsin.com/u/talha",
              dummy_url: "https://cdn.realtorsin.com/utils/dummyTemplates/resume-template.png",
              is_selected: true,
            },
          ],
        },
      },
      {
        skills: [
          {
            id: 1,
            name: "Sales",
            proficiencyLevel: "Advanced",
            yearsOfExperience: null,
            educationIds: [],
            positionIds: [],
          },
          {
            id: 2,
            name: "Marketing",
            proficiencyLevel: null,
            yearsOfExperience: null,
            educationIds: [],
            positionIds: [],
          },
        ],
        isOwn: true,
      }
    );

    expect(profile).toMatchObject({
      id: 92,
      fullName: "Talha Fiaz",
      userName: "talha",
      openTo: "hiring",
      aboutId: 9,
      aboutText: "Hello about",
      topSkillIds: [1, 2],
      positions: [
        {
          title: "Agent",
          isCurrentlyWorking: true,
          skillIds: [],
          imageUrls: [],
        },
      ],
      educations: [
        { school: "UOS", degree: "BBA", skillIds: [], imageUrls: [] },
      ],
      reraImageUrl: null,
      analytics: {
        postImpressions: 2,
        profileViewers: 5,
        searchAppearances: 1,
        connectionsDelta: 3,
      },
      brokerCardVerified: true,
      brokerCardStatus: "approved",
      nicDocumentUrl: null,
      nicDocumentType: null,
      brokerCardDocumentUrl: null,
      brokerCardDocumentType: null,
      hasConnectorBadge: true,
      hasInfluencerBadge: false,
      publicProfileUrl: "https://realtorsin.com/u/talha",
      isOwn: true,
    });
  });

  it("returns null for invalid payload", () => {
    expect(mapSocialProfile({})).toBeNull();
  });
});

describe("mapSkillsList", () => {
  it("maps skills payload", () => {
    const skills = mapSkillsList({
      status: true,
      data: [{ id: 10, skill: "Sales", proficiency_level: "Advanced" }],
    });
    expect(skills).toEqual([
      {
        id: 10,
        name: "Sales",
        proficiencyLevel: "Advanced",
        yearsOfExperience: null,
        educationIds: [],
        positionIds: [],
      },
    ]);
  });
});

describe("formatProfileDateRange", () => {
  it("formats ongoing ranges", () => {
    expect(formatProfileDateRange("2024-01-01", null, "Present")).toContain(
      "Present"
    );
  });
});
