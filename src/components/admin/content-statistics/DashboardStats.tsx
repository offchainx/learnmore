"use client"

import React from 'react';
import { StatCard } from './StatCard';
import { STATS } from './constants';

export const DashboardStats = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </section>
  );
};
