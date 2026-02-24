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
  const a1 = "rgb(var(--accent-1, 122 114 233))";
  const a2 = "rgb(var(--accent-2, 198 207 19))";

  return (
    <div className="inline-flex">
      <div className="relative inline-flex overflow-hidden rounded-full p-[3px]">
        {/* dynamic gradient border (accent-1 -> accent-2) */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            backgroundImage: `linear-gradient(90deg, ${a1}, ${a2}, ${a1})`,
            backgroundSize: "220% 100%",
          }}
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 4.6, ease: "linear", repeat: Infinity }}
        />

        <div className="relative inline-flex items-center gap-3 rounded-full bg-accent-3 px-9 py-4">
          <span className="text-[16px] md:text-[17px] font-semibold text-text">
            RU
          </span>
          <span className="text-text/50">•</span>
          <span className="text-[16px] md:text-[17px] font-semibold text-text">
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
        // если footer рендерится внутри <main className="pb-12 md:pb-20">,
        // это “съедает” нижний padding, чтобы не было пустоты
        "-mb-12 md:-mb-20",
      ].join(" ")}
    >
      {/* top divider */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-bg/10"
      />

      <Container className="relative z-10 px-6 md:px-10 lg:px-12">
        <div className="relative py-12 md:py-14 pb-10 md:pb-12">
          {/* center vertical divider (longer) */}
          <div
            aria-hidden
            className="pointer-events-none hidden lg:block absolute left-1/2 top-0 h-[640px] w-px -translate-x-1/2 bg-bg/10"
          />

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-0">
            {/* LEFT */}
            <div className="min-w-0 lg:pr-10">
              <div className="flex items-center gap-4">
                {/* logo in round mask */}
                <div className="h-12 w-12 shrink-0 rounded-full overflow-hidden ring-1 ring-bg/15 bg-bg/5 flex items-center justify-center">
                  <img
                    src={withBasePath("/brand/uni-logo.svg")}
                    alt="ЮНИ"
                    className="h-[120%] w-[120%] object-contain"
                    draggable={false}
                  />
                </div>

                {/* text aligned to logo center */}
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="hover-accent text-[18px] font-semibold leading-tight">
                    ЮНИ.ai
                  </div>
                  <div className="hover-accent text-[14px] font-medium leading-tight text-bg/70">
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

                <div className="mt-10">
                  <RuBadge />
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="min-w-0 lg:pl-10">
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
                      <a
                        href={LINKS.contacts.email}
                        className="hover-accent transition-colors"
                      >
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
                      <IntLink href={LINKS.docs.privacy}>
                        Политика конфиденциальности
                      </IntLink>
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

              {/* CTA button under divider */}
              <div className="mt-6 flex justify-start sm:justify-end">
                <a
                  href="#cta"
                  className="btn-lift-outline btm-lift-outline rounded-full px-7 py-3 text-[14px] font-semibold"
                >
                  Начать проект
                </a>
              </div>
            </div>
          </div>

          {/* bottom */}
          <div className="mt-8 pt-5 border-t border-bg/10">
            <div className="text-center text-[13px] font-medium text-bg/55 hover-accent">
              Copyright © 2026 Uni.ai (ООО "БЭНИФИТ")
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}