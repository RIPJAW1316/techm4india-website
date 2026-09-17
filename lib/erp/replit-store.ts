"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Employee,
  Lead,
  Institution,
  Project,
  Task,
  Activity,
  ModuleRecord,
  ModuleRecordInput,
  DashboardSummary,
  INITIAL_EMPLOYEES,
  INITIAL_LEADS,
  INITIAL_INSTITUTIONS,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_ACTIVITIES,
  INITIAL_MODULE_RECORDS,
  INITIAL_SUMMARY,
} from "./replit-data";

const STORAGE_KEYS = {
  EMPLOYEES: "techm4india_erp_employees",
  LEADS: "techm4india_erp_leads",
  INSTITUTIONS: "techm4india_erp_institutions",
  PROJECTS: "techm4india_erp_projects",
  TASKS: "techm4india_erp_tasks",
  ACTIVITIES: "techm4india_erp_activities",
  MODULE_RECORDS: "techm4india_erp_module_records",
  SETTINGS: "techm4india_erp_settings",
};

function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore storage write failures */
  }
}

export function useEmployeesData(filters?: { search?: string; department?: string }) {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);

  useEffect(() => {
    setEmployees(getStorageItem(STORAGE_KEYS.EMPLOYEES, INITIAL_EMPLOYEES));
  }, []);

  const addEmployee = useCallback((newEmp: Omit<Employee, "id" | "initials" | "joinedAt">) => {
    const initials = newEmp.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const employee: Employee = {
      ...newEmp,
      id: Date.now(),
      initials,
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    setEmployees((current) => {
      const updated = [employee, ...current];
      setStorageItem(STORAGE_KEYS.EMPLOYEES, updated);
      return updated;
    });

    return employee;
  }, []);

  const filtered = employees.filter((emp) => {
    if (filters?.department && emp.department.toLowerCase() !== filters.department.toLowerCase()) {
      return false;
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      return emp.name.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q) || emp.role.toLowerCase().includes(q);
    }
    return true;
  });

  return { employees: filtered, allEmployees: employees, addEmployee, isLoading: false, isError: false };
}

export function useLeadsData(filters?: { search?: string; stage?: string }) {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);

  useEffect(() => {
    setLeads(getStorageItem(STORAGE_KEYS.LEADS, INITIAL_LEADS));
  }, []);

  const addLead = useCallback((newLead: Omit<Lead, "id" | "initials" | "lastContact">) => {
    const initials = newLead.organization
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const lead: Lead = {
      ...newLead,
      id: Date.now(),
      initials,
      lastContact: "Just now",
    };

    setLeads((current) => {
      const updated = [lead, ...current];
      setStorageItem(STORAGE_KEYS.LEADS, updated);
      return updated;
    });

    return lead;
  }, []);

  const filtered = leads.filter((lead) => {
    if (filters?.stage && lead.stage.toLowerCase() !== filters.stage.toLowerCase()) {
      return false;
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        lead.organization.toLowerCase().includes(q) ||
        lead.owner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return { leads: filtered, allLeads: leads, addLead, isLoading: false, isError: false };
}

export function useInstitutionsData(filters?: { search?: string }) {
  const [institutions, setInstitutions] = useState<Institution[]>(INITIAL_INSTITUTIONS);

  useEffect(() => {
    setInstitutions(getStorageItem(STORAGE_KEYS.INSTITUTIONS, INITIAL_INSTITUTIONS));
  }, []);

  const filtered = institutions.filter((inst) => {
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      return (
        inst.name.toLowerCase().includes(q) ||
        inst.location.toLowerCase().includes(q) ||
        inst.owner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return { institutions: filtered, allInstitutions: institutions, isLoading: false, isError: false };
}

export function useProjectsData() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);

  useEffect(() => {
    setProjects(getStorageItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS));
  }, []);

  return { projects, isLoading: false, isError: false };
}

export function useTasksData(filters?: { status?: string }) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  useEffect(() => {
    setTasks(getStorageItem(STORAGE_KEYS.TASKS, INITIAL_TASKS));
  }, []);

  const updateTaskStatus = useCallback((id: number, nextStatus: string) => {
    setTasks((current) => {
      const updated = current.map((task) => (task.id === id ? { ...task, status: nextStatus } : task));
      setStorageItem(STORAGE_KEYS.TASKS, updated);
      return updated;
    });
  }, []);

  const filtered = tasks.filter((task) => {
    if (filters?.status && task.status.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }
    return true;
  });

  return { tasks: filtered, allTasks: tasks, updateTaskStatus, isLoading: false, isError: false };
}

export function useDashboardData() {
  const [summary, setSummary] = useState<DashboardSummary>(INITIAL_SUMMARY);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);

  useEffect(() => {
    setSummary(getStorageItem(STORAGE_KEYS.SETTINGS + "_summary", INITIAL_SUMMARY));
    setActivities(getStorageItem(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES));
  }, []);

  return { summary, activities, isLoading: false, isError: false };
}

export function useModuleRecordsData(moduleName: string) {
  const [records, setRecords] = useState<ModuleRecord[]>(INITIAL_MODULE_RECORDS);

  useEffect(() => {
    const all = getStorageItem(STORAGE_KEYS.MODULE_RECORDS, INITIAL_MODULE_RECORDS);
    setRecords(all.filter((rec) => rec.module === moduleName));
  }, [moduleName]);

  const addRecord = useCallback(
    (input: ModuleRecordInput) => {
      const initials = input.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const record: ModuleRecord = {
        ...input,
        id: Date.now(),
        module: moduleName,
        initials,
      };

      const all = getStorageItem(STORAGE_KEYS.MODULE_RECORDS, INITIAL_MODULE_RECORDS);
      const updatedAll = [record, ...all];
      setStorageItem(STORAGE_KEYS.MODULE_RECORDS, updatedAll);
      setRecords((current) => [record, ...current]);
      return record;
    },
    [moduleName]
  );

  return { records, addRecord, isLoading: false, isError: false, refetch: () => {} };
}
