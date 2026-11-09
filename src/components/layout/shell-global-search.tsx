"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock,
  Hash,
  Loader2,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarPlaceholderFallback } from "@/components/ui/avatar";
import { fetchSearchPageRequest } from "@/features/feed/services/search.client";
import type { SearchTab } from "@/features/feed/types/search.types";
import { cn } from "@/lib/utils";

const RECENT_KEY = "rin.recentSearches";
const MAX_RECENT = 6;

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {
    /* storage unavailable */
  }
}

function searchHref(tab: SearchTab, text: string) {
  return `/search?${new URLSearchParams({ q: text, tab }).toString()}`;
}

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

type Item = {
  key: string;
  href: string;
  label: string;
  sublabel?: string | null;
  icon?: React.ReactNode;
  query?: string;
};

const SHORTCUTS: Item[] = [
  {
    key: "s-projects",
    href: "/listings?tab=off-plan",
    label: "Off-plan projects",
    icon: <Building2 className="h-4 w-4" aria-hidden />,
  },
  {
    key: "s-jobs",
    href: "/jobs",
    label: "Jobs",
    icon: <BriefcaseBusiness className="h-4 w-4" aria-hidden />,
  },
  {
    key: "s-events",
    href: "/events",
    label: "Events",
    icon: <CalendarDays className="h-4 w-4" aria-hidden />,
  },
];

/**
 * Header search (LinkedIn-style): type in place, live people + hashtag
 * suggestions, and "search posts / people / hashtags" actions that open
 * /search. Recent searches when empty. `/` focuses it from anywhere.
 */
export function ShellGlobalSearch({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  const onNetwork = pathname === "/connections" || pathname.startsWith("/connections/");
  const defaultTab: SearchTab = onNetwork ? "account" : "foryou";
  const q = value.trim();
  const debounced = useDebounced(q, 250);
  const live = open && debounced.length >= 2;

  const peopleQuery = useQuery({
    queryKey: ["global-search", "people", debounced],
    queryFn: ({ signal }) =>
      fetchSearchPageRequest({ page: 1, perPage: 5, searchText: debounced, searchType: "account", signal }),
    enabled: live,
    staleTime: 60_000,
  });
  const tagsQuery = useQuery({
    queryKey: ["global-search", "tags", debounced],
    queryFn: ({ signal }) =>
      fetchSearchPageRequest({ page: 1, perPage: 3, searchText: debounced, searchType: "tags", signal }),
    enabled: live,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (open) setRecent(readRecent());
  }, [open]);

  // Close on outside click; "/" focuses the search from anywhere.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Close when navigating.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const peopleData = peopleQuery.data;
  const tagsData = tagsQuery.data;

  const sections = useMemo(() => {
    if (!q) {
      return [
        {
          title: "Recent",
          items: recent.map<Item>((text) => ({
            key: `r-${text}`,
            href: searchHref(defaultTab, text),
            label: text,
            query: text,
            icon: <Clock className="h-4 w-4" aria-hidden />,
          })),
        },
        { title: "Explore", items: SHORTCUTS },
      ].filter((s) => s.items.length > 0);
    }
    const people = peopleData?.kind === "accounts" ? peopleData.people.slice(0, 5) : [];
    const tags = tagsData?.kind === "tags" ? tagsData.tags.slice(0, 3) : [];
    const actions: Item[] = [
      {
        key: "a-posts",
        href: searchHref("foryou", q),
        label: `Search posts for “${q}”`,
        query: q,
        icon: <Search className="h-4 w-4" aria-hidden />,
      },
      {
        key: "a-people",
        href: searchHref("account", q),
        label: `People named “${q}”`,
        query: q,
        icon: <UserRound className="h-4 w-4" aria-hidden />,
      },
      {
        key: "a-tags",
        href: searchHref("tags", q.replace(/^#/, "")),
        label: `Hashtags matching “${q.replace(/^#/, "")}”`,
        query: q,
        icon: <Hash className="h-4 w-4" aria-hidden />,
      },
    ];
    if (onNetwork) actions.unshift(actions.splice(1, 1)[0]);
    const peopleItems = people.map<Item>((person) => ({
      key: `p-${person.userId}-${person.userName}`,
      href: person.userName
        ? `/u/${person.userName}`
        : person.userId != null
          ? `/profile/${person.userId}`
          : "/connections",
      label: person.name,
      sublabel: [person.role, person.company].filter(Boolean).join(" at ") || person.location,
      query: q,
      icon: (
        <Avatar className="h-7 w-7">
          {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt="" /> : null}
          <AvatarPlaceholderFallback />
        </Avatar>
      ),
    }));
    const tagItems = tags.map<Item>((tag) => {
      const label = tag.tag.replace(/^#/, "");
      return {
        key: `t-${tag.hashtagId}-${label}`,
        href: searchHref("foryou", label),
        label: `#${label}`,
        sublabel: `${tag.count} posts`,
        query: q,
        icon: <Hash className="h-4 w-4" aria-hidden />,
      };
    });
    return [
      { title: "", items: actions },
      { title: "People", items: peopleItems },
      { title: "Hashtags", items: tagItems },
    ].filter((s) => s.items.length > 0);
  }, [q, recent, peopleData, tagsData, onNetwork, defaultTab]);

  const flat = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  useEffect(() => setActive(0), [q]);

  const remember = (text?: string) => {
    const t = text?.trim();
    if (!t) return;
    const next = [t, ...readRecent().filter((r) => r.toLowerCase() !== t.toLowerCase())];
    writeRecent(next);
  };

  const go = (item: Item) => {
    remember(item.query);
    setOpen(false);
    setValue("");
    inputRef.current?.blur();
    router.push(item.href);
  };

  const submit = () => {
    if (!q) return;
    const target = flat[active];
    if (target && active > 0) {
      go(target);
      return;
    }
    go({ key: "submit", href: searchHref(defaultTab, q), label: q, query: q });
  };

  const loading = live && (peopleQuery.isFetching || tagsQuery.isFetching);
  let index = -1;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-9 items-center gap-2 rounded-full bg-muted/70 px-3.5 ring-1 ring-transparent transition-all",
          open ? "bg-background ring-primary/40 shadow-sm" : "hover:bg-muted"
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActive((i) => Math.min(i + 1, Math.max(flat.length - 1, 0)));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (!q && flat[active]) go(flat[active]);
              else submit();
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={onNetwork ? "Search people" : "Search people, posts, hashtags"}
          aria-label="Search RealtorsIn"
          role="combobox"
          aria-expanded={open}
          aria-controls="global-search-results"
          aria-autocomplete="list"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden />
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden rounded border border-border bg-background px-1.5 text-[10px] font-medium text-muted-foreground lg:inline">
            /
          </kbd>
        )}
      </div>

      {open && flat.length > 0 ? (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute start-0 top-[calc(100%+6px)] z-50 w-[min(26rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-border bg-popover py-1.5 text-popover-foreground shadow-xl"
        >
          {sections.map((section, sIndex) => (
            <div key={section.title || `s${sIndex}`} className={cn(sIndex > 0 && "mt-1 border-t border-border/70 pt-1")}>
              {section.title ? (
                <div className="flex items-center justify-between px-4 pb-1 pt-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </p>
                  {section.title === "Recent" ? (
                    <button
                      type="button"
                      className="text-[11px] font-medium text-primary hover:underline"
                      onClick={() => {
                        writeRecent([]);
                        setRecent([]);
                      }}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
              ) : null}
              {section.items.map((item) => {
                index += 1;
                const i = index;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    role="option"
                    aria-selected={active === i}
                    onMouseEnter={() => setActive(i)}
                    onClick={(e) => {
                      e.preventDefault();
                      go(item);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 text-sm",
                      active === i ? "bg-muted" : "hover:bg-muted/60"
                    )}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">{item.label}</span>
                      {item.sublabel ? (
                        <span className="block truncate text-xs text-muted-foreground">{item.sublabel}</span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
