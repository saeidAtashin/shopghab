import type {
  ChangeHandler,
  UseFormRegisterReturn,
} from "react-hook-form";

const AUTOFILL_BG = "#09090b";
const AUTOFILL_FG = "#fafafa";

const AUTOFILL_PROPS = [
  "box-shadow",
  "-webkit-box-shadow",
  "-webkit-text-fill-color",
  "color",
  "caret-color",
  "background-color",
] as const;

export function applyNeonAutofillFix(
  el: HTMLInputElement | HTMLTextAreaElement,
) {
  requestAnimationFrame(() => {
    if (el.matches(":-webkit-autofill")) {
      el.style.setProperty(
        "box-shadow",
        `0 0 0 1000px ${AUTOFILL_BG} inset`,
        "important",
      );
      el.style.setProperty(
        "-webkit-box-shadow",
        `0 0 0 1000px ${AUTOFILL_BG} inset`,
        "important",
      );
      el.style.setProperty("-webkit-text-fill-color", AUTOFILL_FG, "important");
      el.style.setProperty("color", AUTOFILL_FG, "important");
      el.style.setProperty("caret-color", AUTOFILL_FG, "important");
      el.style.setProperty("background-color", AUTOFILL_BG, "important");
      return;
    }

    for (const prop of AUTOFILL_PROPS) {
      el.style.removeProperty(prop);
    }
  });
}

/** Spread onto react-hook-form text inputs that use `.input-neon`. */
export function neonInputProps(
  field: UseFormRegisterReturn,
): UseFormRegisterReturn & {
  onAnimationStart: React.AnimationEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
  onInput: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
} {
  const { onChange, ...rest } = field;

  const wrappedOnChange: ChangeHandler = async (event) => {
    await onChange(event);
    applyNeonAutofillFix(event.target as HTMLInputElement);
  };

  return {
    ...rest,
    onChange: wrappedOnChange,
    onAnimationStart: (event) => {
      if (event.animationName === "input-neon-autofill") {
        applyNeonAutofillFix(event.currentTarget);
      }
    },
    onInput: (event) => {
      applyNeonAutofillFix(event.currentTarget);
    },
  };
}
