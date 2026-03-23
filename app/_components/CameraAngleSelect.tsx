'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import { Listbox, Transition, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { angles } from '@/app/_constants/scene';

interface CameraAngleSelectProps {
  value: typeof angles[0];
  onChange: (angle: typeof angles[0]) => void;
}

export default function CameraAngleSelect({ value, onChange }: CameraAngleSelectProps) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative inline-block text-left">
        <ListboxButton className="relative w-24 h-24 overflow-hidden rounded-2xl bg-black/40 border border-white/5 hover:border-primary-100 transition-all shadow-xl group">
          <Image
            src={`/images/${value.fileName}`}
            alt={value.name}
            fill
            className="object-cover opacity-60 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/80 backdrop-blur-md">
            <span className="block truncate text-[9px] font-black text-white uppercase tracking-tighter leading-none">
              {value.name}
            </span>
          </div>
        </ListboxButton>

        <Transition
          as={Fragment}
          enter="transition duration-100 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition duration-75 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <ListboxOptions 
            anchor="bottom start"
            className="w-[640px] bg-[#0a0a0a] border border-white/10 rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-[200] grid grid-cols-5 gap-1 p-2 focus:outline-none [--anchor-gap:8px] backdrop-blur-3xl overflow-hidden"
          >
            {angles.map((angle) => (
              <ListboxOption
                key={angle.id}
                value={angle}
                className={({ active, selected }) =>
                  `relative cursor-pointer select-none rounded-lg border transition-all ${active || selected
                    ? 'bg-primary-300/10 border-primary-300'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex flex-col overflow-hidden rounded-lg">
                    <div className="relative aspect-square w-full overflow-hidden bg-black/40">
                      <Image
                        src={`/images/${angle.fileName}`}
                        alt={angle.name}
                        fill
                        className={`object-cover transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-60'}`}
                        sizes="120px"
                      />
                    </div>
                    <div className="p-2 py-3 flex flex-col items-center justify-center bg-black/20">
                      <span className={`block truncate text-[11px] font-black tracking-tight text-white/90 ${selected ? 'text-primary-100' : ''}`}>
                        {angle.name}
                      </span>
                    </div>
                  </div>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox >
  );
}
