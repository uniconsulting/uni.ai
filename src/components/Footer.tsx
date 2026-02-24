"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { withBasePath } from "@/lib/basePath";

const LINKS = {
  contacts: {
    phone: "+7 (995) 518-69-42",
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
  const isHttp = href.startsWith("http");
  return (
    <a
      href={href}
      target={isHttp ? "_blank" : undefined}
      rel={isHttp ? "noreferrer" : undefined}
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
      <div className="relative inline-flex rounded-[26px] p-[2px]">
        {/* динамичный градиент-бордюр accent-1 -> accent-2 */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-r from-accent-1 via-accent-2 to-accent-1"
          style={{ backgroundSize: "260% 260%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 6.8, ease: "linear", repeat: Infinity }}
        />
        <div className="relative inline-flex items-center gap-3 rounded-[24px] bg-accent-3 px-10 py-6">
          <span className="text-[18px] font-semibold text-text">RU</span>
          <span className="text-text/45">•</span>
          <span className="text-[18px] font-semibold text-text">
            Продукт сделан в России
          </span>
        </div>
      </div>
    </div>
  );
}

function Col({
  title,
  children,
  showDivider,
}: {
  title: string;
  children: ReactNode;
  showDivider?: boolean;
}) {
  return (
    <div className="relative min-w-0 px-10 lg:px-12 pt-10 lg:pt-12">
      {/* вертикальный разделитель: от верхнего края красной секции вниз 270px */}
      {showDivider ? (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-[270px] w-px bg-bg/18"
        />
      ) : null}

      <div className="hover-accent text-[20px] font-extrabold text-bg">
        {title}
      </div>

      <div className="mt-6 space-y-4 text-[12px] font-medium text-bg/90">
        {children}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer
      id="footer"
      className={[
        "w-full",
        // убираем белый воздух под футером, если в main есть pb-12 / md:pb-20
        "-mb-12 md:-mb-20",
      ].join(" ")}
    >
      {/* фиксируем “канвас” 1440px на lg, чтобы правая зона была ровно 960px */}
      <div className="mx-auto w-full lg:w-[1440px]">
        {/* TOP AREA: 620px */}
        <div className="relative w-full lg:h-[620px]">
          {/* вертикальная граница между 480 и 960 без влияния на ширину */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[480px] top-0 hidden h-full w-px bg-text/12 lg:block"
          />

          <div className="grid w-full lg:h-full lg:grid-cols-[480px_960px]">
            {/* LEFT (bg): 480x620 */}
            <div className="bg-bg text-text">
              <div className="h-full px-10 lg:px-12 pt-[57px] pb-[57px]">
                {/* brand row */}
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 shrink-0 rounded-full bg-accent-1 overflow-hidden flex items-center justify-center">
                    <img
                      src={withBasePath("/brand/uni-logo.svg")}
                      alt="ЮНИ"
                      className="h-[120%] w-[120%] object-contain"
                      draggable={false}
                    />
                  </div>

                  <div className="min-w-0 flex flex-col justify-center">
                    <div className="hover-accent text-[20px] font-extrabold leading-none">
                      ЮНИ.ai
                    </div>
                    <div className="hover-accent mt-1 text-[14px] font-medium text-text/70 leading-snug">
                      Системы для SMB с ИИ
                    </div>
                  </div>
                </div>

                {/* divider #1: от левого края белой секции */}
                <div className="mt-[57px] -mx-10 lg:-mx-12 h-px bg-text/12" />

                {/* реквизиты: 4 строки, одинаковый leading, 14px */}
                <div className="mt-[57px] text-[14px] leading-[1.75] text-text/80">
                  <div className="hover-accent font-semibold text-text/85">
                    ООО БЭНИФИТ
                  </div>
                  <div className="hover-accent font-medium">
                    ИНН: 7300031274 • ОГРН: 1247300003257
                  </div>
                  <div className="hover-accent font-medium">
                    обл. Ульяновская, г. Ульяновск,
                  </div>
                  <div className="hover-accent font-medium">
                    ул. Жигулевская, д. 17.
                  </div>
                </div>

                {/* divider #2: от левого края белой секции */}
                <div className="mt-[57px] -mx-10 lg:-mx-12 h-px bg-text/12" />

                {/* RU badge */}
                <div className="mt-[57px]">
                  <RuBadge />
                </div>
              </div>
            </div>

            {/* RIGHT: 960x620 = (red 470) + (dark 150) */}
            <div className="min-w-0">
              {/* TOP RED: 960x470 */}
              <div className="relative bg-accent-1 text-bg lg:h-[470px] overflow-hidden">
                {/* watermark: 90px, по центральной вертикали красной секции */}
                <div
                  aria-hidden
                  className="pointer-events-none select-none absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="whitespace-nowrap text-bg/18 font-normal leading-none tracking-tight text-[90px]">
                    衆志、城を成す
                  </div>
                </div>

                <div className="relative z-10 grid md:grid-cols-3">
                  <Col title="Блог">
                    <div>
                      <ExtLink href={LINKS.blog.tgChannel}>Telegram-канал</ExtLink>
                    </div>
                    <div>
                      <ExtLink href={LINKS.blog.tenchat}>TenChat</ExtLink>
                    </div>
                  </Col>

                  <Col title="Контакты" showDivider>
                    <div className="hover-accent">{LINKS.contacts.phone}</div>
                    <div>
                      <ExtLink href={LINKS.contacts.tg}>Telegram</ExtLink>
                    </div>
                    <div>
                      <ExtLink href={LINKS.contacts.email}>uni.kit@mail.ru</ExtLink>
                    </div>
                    <div>
                      <ExtLink href={LINKS.contacts.issue}>Сообщить о проблеме</ExtLink>
                    </div>
                  </Col>

                  <Col title="Документация" showDivider>
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
                  </Col>
                </div>
              </div>

              {/* BOTTOM DARK: 960x150 */}
              <div className="bg-text text-bg lg:h-[150px]">
                <div aria-hidden className="h-px w-full bg-bg/18" />

                <div className="h-full px-10 lg:px-12 flex items-center">
                  <div className="h-px flex-1 bg-bg/18" />
                  <a
                    href="#cta"
                    className="ml-10 hover-accent text-[22px] md:text-[26px] lg:text-[30px] font-extrabold tracking-tight whitespace-nowrap"
                  >
                    начать проект
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* разделитель перед синей полосой */}
          <div aria-hidden className="h-px w-full bg-text/12" />
        </div>

        {/* BOTTOM BAR (accent-2): 1440x100 */}
        <div className="bg-accent-2 text-bg lg:h-[100px]">
          <div className="h-full px-10 lg:px-12 flex items-center justify-between">
            <div className="hover-accent text-[16px] font-medium">
              © 2026 (ООО "БЭНИФИТ")
            </div>
            <div className="hover-accent text-[16px] font-medium">
              Сделано ЮНИ.ai
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
