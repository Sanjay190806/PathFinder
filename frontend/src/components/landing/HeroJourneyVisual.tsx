import React from "react";
import { ArrowRight, GraduationCap, Brain, Map, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: GraduationCap,
    title: "Current Baseline",
    detail: "Assesses what you know to skip repeat basics.",
    status: "Evaluated",
    gradient: "from-blue-500 to-cyan-500",
    statusColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    icon: Brain,
    title: "Prerequisite DAG",
    detail: "Identifies foundation dependencies before unlocking advanced topics.",
    status: "0% Violations",
    gradient: "from-purple-500 to-pink-500",
    statusColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    icon: Map,
    title: "Adaptive Roadmap",
    detail: "Sequences courses & projects based on your pace.",
    status: "Personalized",
    gradient: "from-primary to-blue-500",
    statusColor: "bg-primary/10 text-primary border-primary/20",
  },
  {
    icon: Rocket,
    title: "Career Ready",
    detail: "Capstone portfolio projects prove industry-grade competency.",
    status: "Target Goal",
    gradient: "from-orange-500 to-amber-500",
    statusColor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
];

export function HeroJourneyVisual() {
  return (
    <div className="w-full rounded-3xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
            <Map className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Product Journey Architecture
            </span>
            <h3 className="text-sm font-bold text-foreground tracking-tight">
              How PathFinder Guides Your Growth
            </h3>
          </div>
        </div>
        <span className="rounded-lg border border-border bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          Domain-Agnostic Engine
        </span>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative rounded-2xl border border-border bg-background p-5 flex flex-col justify-between group cursor-default hover:border-primary/30 hover:shadow-md transition-all duration-200"
          >
            {/* Icon */}
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-md mb-4 group-hover:scale-110 transition-transform`}>
              <s.icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div>
              <h4 className="text-sm font-bold text-foreground tracking-tight mb-1">{s.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.detail}</p>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.statusColor}`}>
                {s.status}
              </span>
              {idx < steps.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
