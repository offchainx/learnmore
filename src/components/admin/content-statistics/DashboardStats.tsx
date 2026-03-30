"use client"

import React from 'react';
import { StatCard } from './StatCard';
import { STATS } from './constants';

export const DashboardStats = () => {
  return (
    <section className="grid grid-cols-1 gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
      {STATS.map((stat) => (
        <StatCard key={stat.id} {...stat} />
      ))}
    </section>
  );
};
