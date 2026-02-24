/* src/components/Footer.tsx */
"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/Container";
import { withBasePath } from "@/lib/basePath";

const LINKS = {
  contacts: {
    tg: "https://t.me/uni_smb",
    email: "mailto:uni.kit@mail.ru",
    issue: "https://t.me/uni_smb",
  },
  blog: {
    tgChannel: "https://t.me/uniconsulting",
    tenchat: "https://m.tenchat.ru/u/xuxnFlqD",
  },
  docs: {
    privacy: "/docs/privacy",
    opd: "/docs/opd-consent",
    offer: "/docs/offer",
    cookies: "/docs/cookies",
  },
};

function ExtLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`hover-accent transition-colors ${className}`}
    >
      {children}
    </a>
  );
}

function IntLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={`hover-accent transition-colors ${className}`}>
      {children}
    </a>
  );
}

function RuBadge() {
  return (
    <div className="inline-flex">
      <div className="group relative inline-flex rounded-full p-[2.5px]">
        {/* glow layer */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-45 blur-[10px]"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, #7a72e9, #c6cf13, #9caf88, #7a72e9)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity }}
        />
        {/* crisp border layer */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-95"
          style={{
            background:
              "conic-gradient(from 180deg at 50% 50%, #7a72e9, #c6cf13, #9caf88, #7a72e9)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 7.5, ease: "linear", repeat: Infinity }}
        />

        <div className="relative inline-flex items-center gap-3 rounded-full bg-accent-3 px-7 py-3.5">
          <span className="text-[15px] md:text-[16px] font-semibold text-text">
            RU
          </span>
          <span className="text-text/50">•</span>
          <span className="text-[15px] md:text-[16px] font-semibold text-text">
            Продукт сделан в России
          </span>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      id="footer"
      className={[
        "relative w-full bg-text text-bg",
        // если где-то есть padding-bottom на wrapper'е (например main pb-12),
        // это аккуратно “дотягивает” футер до низа
        "-mb-12 md:-mb-20",
      ].join(" ")}
    >
      {/* top divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-bg/10"
      />

      <Container className="relative z-10 px-6 md:px-10 lg:px-12">
        <div className="py-12 md:py-14 pb-16 md:pb-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,680px)] lg:items-start">
            {/* LEFT */}
            <div className="min-w-0">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 shrink-0">
                  <img
                    src={withBasePath("/brand/uni-logo.svg")}
                    alt="ЮНИ"
                    className="h-[120%] w-[120%] object-contain"
                    draggable={false}
                  />
                </div>

                {/* выравнивание текста по центральной горизонтали лого */}
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="hover-accent text-[18px] font-semibold leading-none">
                    ЮНИ.ai
                  </div>
                  <div className="hover-accent mt-1 text-[14px] font-medium text-bg/70">
                    Системы для SMB с ИИ японского качества
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-bg/10 pt-8">
                <div className="hover-accent text-[16px] font-medium text-bg/80">
                  СТЭП = Стабильность. Точность. Эффективность. Простота.
                </div>

                <div className="mt-8 space-y-2">
                  <div className="hover-accent text-[14px] font-semibold text-bg/80">
                    ООО БЭНИФИТ
                  </div>
                  <div className="hover-accent text-[14px] font-medium text-bg/65">
                    ИНН: 7300031274 • ОГРН: 1247300003257
                  </div>
                  <div className="hover-accent text-[14px] font-medium text-bg/65">
                    обл. Ульяновская, г. Ульяновск, ул. Жигулевская, д. 17.
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <RuBadge />

                  <a
                    href="#cta"
                    className="btn-lift-outline btm-lift-outline rounded-full px-6 py-3 text-[14px] font-semibold"
                  >
                    Начать проект
                  </a>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="min-w-0 lg:pl-10 lg:pr-10 lg:border-l lg:border-bg/10">
              {/* небольшой разделитель сверху, чтобы блок справа “собрался” */}
              <div className="mb-8 hidden lg:block h-px w-full bg-bg/10" />

              <div className="grid gap-10 sm:grid-cols-3 sm:gap-x-10">
                {/* BLOG */}
                <div className="min-w-0">
                  <div className="hover-accent text-[14px] font-semibold text-bg/85">
                    Блог
                  </div>

                  <div className="mt-5 space-y-3 text-[14px] font-medium text-bg/65">
                    <div>
                      <ExtLink href={LINKS.blog.tgChannel}>Telegram-канал</ExtLink>
                    </div>
                    <div>
                      <ExtLink href={LINKS.blog.tenchat}>TenChat</ExtLink>
                    </div>
                  </div>
                </div>

                {/* CONTACTS (чуть ближе к “Блог”) */}
                <div className="min-w-0 sm:-ml-2">
                  <div className="hover-accent text-[14px] font-semibold text-bg/85">
                    Контакты
                  </div>

                  <div className="mt-5 space-y-3 text-[14px] font-medium text-bg/65">
                    <div className="hover-accent">+7 (995) 518-69-42</div>
                    <div>
                      <ExtLink href={LINKS.contacts.tg}>Telegram</ExtLink>
                    </div>
                    <div>
                      <a href={LINKS.contacts.email} className="hover-accent transition-colors">
                        uni.kit@mail.ru
                      </a>
                    </div>
                    <div>
                      <ExtLink href={LINKS.contacts.issue}>Сообщить о проблеме</ExtLink>
                    </div>
                  </div>
                </div>

                {/* DOCS */}
                <div className="min-w-0">
                  <div className="hover-accent text-[14px] font-semibold text-bg/85">
                    Документы
                  </div>

                  <div className="mt-5 space-y-3 text-[14px] font-medium text-bg/65">
                    <div>
                      <IntLink href={LINKS.docs.privacy}>Политика конфиденциальности</IntLink>
                    </div>
                    <div>
                      <IntLink href={LINKS.docs.opd}>Согласие ОПД клиента</IntLink>
                    </div>
                    <div>
                      <IntLink href={LINKS.docs.offer}>Публичная оферта</IntLink>
                    </div>
                    <div>
                      <IntLink href={LINKS.docs.cookies}>Политика cookies</IntLink>
                    </div>
                  </div>
                </div>
              </div>

              {/* divider under columns */}
              <div className="mt-10 h-px w-full bg-bg/10" />
            </div>
          </div>

          {/* bottom */}
          <div className="mt-10 pt-8">
            <div className="text-center text-[13px] font-medium text-bg/55 hover-accent">
              Copyright © 2026 Uni.ai (ООО "БЭНИФИТ")
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}