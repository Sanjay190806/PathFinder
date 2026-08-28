import React from "react";
import { Target, Cpu, Shield, Code, Server, Database, ArrowRight } from "lucide-react";
import Link from "next/link";

export function CareerDomainCards() {
  const domains = [
    {
      role: "AI/ML Engineer",
      icon: <Cpu className="h-5 w-5 text-primary-400" />,
      skills: ["Python", "Linear Algebra", "PyTorch", "Transformers", "MLOps"],
      category: "Artificial Intelligence"
    },
    {
      role: "Cybersecurity Analyst",
      icon: <Shield className="h-5 w-5 text-emerald-400" />,
      skills: ["TCP/IP Networking", "Linux Hardening", "Cryptography", "Penetration Testing"],
      category: "Information Security"
    },
    {
      role: "VLSI Hardware Engineer",
      icon: <Target className="h-5 w-5 text-amber-400" />,
      skills: ["Digital Logic", "Verilog HDL", "Computer Architecture", "ASIC Physical Design"],
      category: "Hardware & Semiconductor"
    },
    {
      role: "Full Stack Developer",
      icon: <Code className="h-5 w-5 text-cyan-400" />,
      skills: ["TypeScript", "React & Next.js", "FastAPI / Node", "PostgreSQL", "Docker"],
      category: "Software Engineering"
    },
    {
      role: "Cloud / DevOps Engineer",
      icon: <Server className="h-5 w-5 text-purple-400" />,
      skills: ["Linux Admin", "CI/CD Automation", "Docker", "Kubernetes", "AWS Infrastructure"],
      category: "Infrastructure & Cloud"
    },
    {
      role: "Data Scientist",
      icon: <Database className="h-5 w-5 text-rose-400" />,
      skills: ["SQL Analytics", "Exploratory Data Analysis", "Applied Statistics", "PySpark"],
      category: "Data & Analytics"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {domains.map((d, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-surface-border bg-surface p-5 flex flex-col justify-between hover:border-slate-600 transition-all duration-150"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-surface-border">
                {d.icon}
              </div>
              <span className="rounded-md bg-surface-raised px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-surface-border">
                {d.category}
              </span>
            </div>
            <h4 className="text-base font-bold text-white tracking-tight">{d.role}</h4>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {d.skills.map((s, sIdx) => (
                <span
                  key={sIdx}
                  className="rounded-md bg-surface-raised/80 border border-surface-border px-2 py-0.5 text-[11px] font-medium text-slate-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-surface-border flex items-center justify-between">
            <Link
              href="/onboarding"
              className="text-xs font-semibold text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 transition-colors"
            >
              Explore this career roadmap <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
