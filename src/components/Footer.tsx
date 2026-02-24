/* src/components/Footer.tsx */
"use client";

import { Container } from "@/components/Container";

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
  children: React.ReactNode;
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
  children: React.ReactNode;
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
    <div className="group inline-flex">
      <div className="relative inline-flex rounded-full p-[1.5px]">
        {/* animated gradient border */}
        <div
          aria-hidden
          className={[
            "absolute inset-0 rounded-full",
            "bg-[conic-gradient(from_180deg_at_50%_50%,#7a72e9,#c6cf13,#9caf88,#7a72e9)]",
            "animate-spin",
            "opacity-90 group-hover:opacity-100 transition-opacity",
          ].join(" ")}
        />
        <div className="relative inline-flex items-center gap-2 rounded-full bg-accent-3 px-5 py-2.5">
          <span className="text-[14px] font-semibold text-text">RU</span>
          <span className="text-text/50">•</span>
          <span className="text-[14px] font-semibold text-text">Продукт сделан в России</span>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer id="footer" className="relative bg-text text-bg">
      {/* top divider */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2 bg-bg/10" />

      <Container className="relative z-10 px-6 md:px-10 lg:px-12">
        <div className="py-12 md:py-14">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            {/* LEFT */}
            <div className="min-w-0">
              <div className="flex items-start gap-4">
                <div className="mt-1 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-1 text-bg">
                  <span className="text-[18px] font-extrabold leading-none">Ю</span>
                </div>

                <div className="min-w-0">
                  <div className="hover-accent text-[18px] font-semibold leading-none">ЮНИ.ai</div>
                  <div className="hover-accent mt-1 text-[14px] font-medium text-bg/70">
                    Системы для SMB с ИИ японского качества
                  </div>
                </div>
              </div>

              <div className="hover-accent mt-8 text-[16px] font-medium text-bg/80">
                СТЭП = Стабильность. Точность. Эффективность. Простота.
              </div>

              <div className="mt-8 space-y-2">
                <div className="hover-accent text-[14px] font-semibold text-bg/80">ООО БЭНИФИТ</div>
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

            {/* RIGHT: 3 columns */}
            <div className="grid gap-12 sm:grid-cols-3">
              {/* BLOG */}
              <div className="min-w-0">
                <div className="hover-accent text-[14px] font-semibold text-bg/85">Блог</div>

                <div className="mt-5 space-y-3 text-[14px] font-medium text-bg/65">
                  <div>
                    <ExtLink href={LINKS.blog.tgChannel}>Telegram-канал</ExtLink>
                  </div>
                  <div>
                    <ExtLink href={LINKS.blog.tenchat}>TenChat</ExtLink>
                  </div>
                </div>
              </div>

              {/* CONTACTS */}
              <div className="min-w-0">
                <div className="hover-accent text-[14px] font-semibold text-bg/85">Контакты</div>

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
                <div className="hover-accent text-[14px] font-semibold text-bg/85">Документы</div>

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
          </div>

          {/* bottom */}
          <div className="mt-12 pt-8 border-t border-bg/10">
            <div className="text-center text-[13px] font-medium text-bg/55 hover-accent">
              Copyright © 2026 Uni.ai (ООО "БЭНИФИТ")
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}