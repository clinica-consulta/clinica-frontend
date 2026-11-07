import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Blocos que aparecem com animação: cartões e seções da página. */
const TARGETS = ".surface, article, [data-reveal]";
/** Nunca anima dentro de janelas, menus ou onde a página pedir. */
const SKIP = '[role="dialog"], [role="listbox"], [role="menu"], [data-no-reveal]';

/**
 * Animação sutil ao rolar: cada cartão ou seção sobe 12px e aparece ao entrar na tela, uma única vez.
 * Listas aparecem em cascata rápida. Também vale para o que chega depois (dados da API, troca de página).
 *
 * - Com "reduzir movimento" ligado no sistema, não anima nada.
 * - O conteúdo só é escondido no instante em que a animação é preparada; se algo falhar, ele continua visível.
 * - `active` = false adia tudo (por exemplo, enquanto a tela de carregamento cobre a página).
 * - Mudar `resetKey` recomeça do zero (por exemplo, quando o elemento raiz é recriado).
 */
export function useScrollReveal(root: RefObject<HTMLElement | null>, active = true, resetKey?: unknown) {
  useEffect(() => {
    const container = root.current;
    if (!container || !active) return;
    if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const seen = new WeakSet<Element>();
    const triggers: ScrollTrigger[] = [];
    let frame = 0;

    // Só o bloco mais externo anima: um cartão dentro de outro cartão acompanha o de fora.
    const outermost = (element: Element) => {
      const parent = element.parentElement?.closest(TARGETS);
      return !parent || !container.contains(parent);
    };

    const scan = () => {
      frame = 0;
      const fresh = Array.from(container.querySelectorAll<HTMLElement>(TARGETS)).filter(
        (element) => !seen.has(element) && !element.closest(SKIP) && outermost(element),
      );
      if (!fresh.length) return;
      fresh.forEach((element) => seen.add(element));

      // O que já ficou para trás na rolagem aparece direto, sem animação.
      const visible = fresh.filter((element) => element.getBoundingClientRect().bottom > 0);
      if (!visible.length) return;

      gsap.set(visible, { autoAlpha: 0, y: 12 });
      triggers.push(
        ...ScrollTrigger.batch(visible, {
          start: "top 94%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out", stagger: 0.05, overwrite: true, clearProps: "opacity,visibility,transform" }),
        }),
      );
      ScrollTrigger.refresh();
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(scan);
    };
    schedule();
    // Conteúdo novo (dados que chegam da API, outra página, mais itens na lista) também entra animado.
    const observer = new MutationObserver(schedule);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      triggers.forEach((trigger) => trigger.kill());
      // Nada fica escondido se a página sair no meio da animação.
      gsap.set(container.querySelectorAll(TARGETS), { clearProps: "opacity,visibility,transform" });
    };
  }, [root, active, resetKey]);
}
