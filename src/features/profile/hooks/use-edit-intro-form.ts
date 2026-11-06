"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeIntroRole } from "@/features/profile/lib/edit-intro.utils";
import type { SocialProfile } from "@/features/profile/types/profile.types";
import type { EditIntroInput } from "@/features/profile/validators/profile.validators";

export function useEditIntroForm(open: boolean, profile: SocialProfile) {
  const syncedOpenRef = useRef(false);
  const knownPositionIdsRef = useRef<Set<number>>(new Set());
  const knownEducationIdsRef = useRef<Set<number>>(new Set());

  const [name, setName] = useState(profile.name);
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [userName, setUserName] = useState(profile.userName ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [phoneDialCode, setPhoneDialCode] = useState(
    profile.phoneDialCode ?? "971"
  );
  const [phoneCountryCode, setPhoneCountryCode] = useState(
    profile.phoneCountryCode ?? "AE"
  );
  const [description, setDescription] = useState(profile.description ?? "");
  const [company, setCompany] = useState(profile.company ?? "");
  const [userRole, setUserRole] = useState(
    normalizeIntroRole(profile.userRole) ?? ""
  );
  const [location, setLocation] = useState(profile.location ?? "");
  const [showCompany, setShowCompany] = useState(profile.showCompany);
  const [showRole, setShowRole] = useState(profile.showRole);
  const [positionId, setPositionId] = useState(
    profile.featuredPositionId != null
      ? String(profile.featuredPositionId)
      : ""
  );
  const [educationId, setEducationId] = useState(
    profile.featuredEducationId != null
      ? String(profile.featuredEducationId)
      : ""
  );
  const [socialProfileLinks, setSocialProfileLinks] = useState(
    profile.socialProfileLinks ?? ""
  );
  const [agencyName, setAgencyName] = useState(profile.agencyName ?? "");
  const [reraNumber, setReraNumber] = useState(profile.reraNumber ?? "");
  const [ornNumber, setOrnNumber] = useState(profile.ornNumber ?? "");
  const [cities, setCities] = useState<string[]>(profile.cities);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(
    profile.propertyTypes
  );

  useEffect(() => {
    if (!open) {
      syncedOpenRef.current = false;
      return;
    }
    if (syncedOpenRef.current) return;
    syncedOpenRef.current = true;
    knownPositionIdsRef.current = new Set(profile.positions.map((p) => p.id));
    knownEducationIdsRef.current = new Set(profile.educations.map((e) => e.id));
    setName(profile.name);
    setLastName(profile.lastName ?? "");
    setUserName(profile.userName ?? "");
    setEmail(profile.email ?? "");
    setPhone(profile.phone ?? "");
    setPhoneDialCode(profile.phoneDialCode ?? "971");
    setPhoneCountryCode(profile.phoneCountryCode ?? "AE");
    setDescription(profile.description ?? "");
    setCompany(profile.company ?? "");
    setUserRole(normalizeIntroRole(profile.userRole) ?? "");
    setLocation(profile.location ?? "");
    setShowCompany(profile.showCompany);
    setShowRole(profile.showRole);
    setPositionId(
      profile.featuredPositionId != null
        ? String(profile.featuredPositionId)
        : ""
    );
    setEducationId(
      profile.featuredEducationId != null
        ? String(profile.featuredEducationId)
        : ""
    );
    setSocialProfileLinks(profile.socialProfileLinks ?? "");
    setAgencyName(profile.agencyName ?? "");
    setReraNumber(profile.reraNumber ?? "");
    setOrnNumber(profile.ornNumber ?? "");
    setCities(profile.cities);
    setPropertyTypes(profile.propertyTypes);
  }, [open, profile]);

  // After nested create, select the newly added position/education.
  useEffect(() => {
    if (!open || !syncedOpenRef.current) return;
    const nextPos = profile.positions.find(
      (item) => !knownPositionIdsRef.current.has(item.id)
    );
    if (nextPos) {
      knownPositionIdsRef.current.add(nextPos.id);
      setPositionId(String(nextPos.id));
    }
    const nextEdu = profile.educations.find(
      (item) => !knownEducationIdsRef.current.has(item.id)
    );
    if (nextEdu) {
      knownEducationIdsRef.current.add(nextEdu.id);
      setEducationId(String(nextEdu.id));
    }
  }, [open, profile.positions, profile.educations]);

  function onEmailChange(value: string) {
    setEmail(value);
    if (!userName.trim() && value.includes("@")) {
      const local = value.split("@")[0]?.trim().replace(/\./g, "_");
      if (local) setUserName(local);
    }
  }

  const canSave =
    !!name.trim() &&
    !!lastName.trim() &&
    !!userName.trim() &&
    !!email.trim() &&
    !!phone.trim() &&
    !!location.trim() &&
    !!company.trim() &&
    !!userRole;

  function toInput(): EditIntroInput {
    return {
      name: name.trim(),
      lastName: lastName.trim(),
      userName: userName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      phoneDialCode: phoneDialCode.trim(),
      phoneCountryCode: phoneCountryCode.trim().toLowerCase(),
      description: description.trim(),
      company: company.trim(),
      userRole: userRole
        ? (userRole as NonNullable<EditIntroInput["userRole"]>)
        : null,
      location: location.trim(),
      showCompany,
      showRole,
      positionId: positionId ? Number(positionId) : null,
      educationId: educationId ? Number(educationId) : null,
      socialProfileLinks: socialProfileLinks.trim(),
      agencyName: agencyName.trim(),
      reraNumber: reraNumber.trim(),
      ornNumber: ornNumber.trim(),
      cities,
      propertyTypes,
    };
  }

  return {
    name,
    setName,
    lastName,
    setLastName,
    userName,
    setUserName,
    email,
    onEmailChange,
    phone,
    setPhone,
    phoneDialCode,
    setPhoneDialCode,
    phoneCountryCode,
    setPhoneCountryCode,
    description,
    setDescription,
    company,
    setCompany,
    userRole,
    setUserRole,
    location,
    setLocation,
    showCompany,
    setShowCompany,
    showRole,
    setShowRole,
    positionId,
    setPositionId,
    educationId,
    setEducationId,
    socialProfileLinks,
    setSocialProfileLinks,
    agencyName,
    setAgencyName,
    reraNumber,
    setReraNumber,
    ornNumber,
    setOrnNumber,
    cities,
    setCities,
    propertyTypes,
    setPropertyTypes,
    canSave,
    toInput,
  };
}
