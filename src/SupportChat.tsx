import { useEffect, useRef, useState, type FormEvent } from "react";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type QuickQuestion = {
  label: string;
  prompt: string;
};

const quickQuestions: QuickQuestion[] = [
  { label: "Servicios", prompt: "¿Qué servicios ofrecen?" },
  { label: "Instalación", prompt: "¿Cómo funciona la instalación?" },
  { label: "Cotización", prompt: "¿Qué necesitan para cotizar?" },
  { label: "Compatibilidad", prompt: "¿Cómo revisan la compatibilidad?" },
  { label: "Despacho", prompt: "¿Hacen despacho o retiro?" },
  { label: "Contacto", prompt: "¿Cómo puedo hablar con DRG?" },
];

const initialMessage: ChatMessage = {
  id: 1,
  role: "assistant",
  text: "Hola. Soy el asistente de DRG. Puedo orientarte sobre servicios, cotizaciones, compatibilidad, instalación y despacho.",
};

function answerFor(question: string) {
  const normalized = question.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (/servicio|que hacen|ofrecen|producto|equipo/.test(normalized)) {
    return "Trabajamos con equipos multimedia, pantallas, CarPlay, audio, cámaras, accesorios y servicios de instalación o diagnóstico para vehículos.";
  }
  if (/instal|domicilio|visita|coordinar|coordinacion/.test(normalized)) {
    return "La instalación se realiza previa coordinación. Primero revisamos la cotización, compatibilidad y ubicación; luego acordamos día, hora y lugar para instalar y probar el equipo.";
  }
  if (/cotiz|precio|valor|cuanto|cuánto|presupuesto/.test(normalized)) {
    return "Para cotizar necesitamos marca, modelo, año y qué quieres mejorar. Con esos datos revisamos compatibilidad, equipo, instalación y despacho; el valor final se confirma antes de coordinar.";
  }
  if (/compat|marca|modelo|ano|año/.test(normalized)) {
    return "Revisamos marca, modelo y año antes de recomendar un equipo. Así confirmamos conectores, funciones disponibles y si la instalación es compatible con tu vehículo.";
  }
  if (/despacho|retiro|envio|envío|entrega/.test(normalized)) {
    return "Puedes coordinar retiro o solicitar despacho. La cobertura y el costo se confirman junto con la cotización, según tu comuna y el tipo de equipo.";
  }
  if (/contact|hablar|whatsapp|instagram|persona/.test(normalized)) {
    return "Puedes solicitar una cotización desde el botón de contacto o escribir por Instagram. En una versión personalizada también se puede conectar el formulario con WhatsApp o un panel.";
  }
  if (/pago|comprar|cobro|tarjeta/.test(normalized)) {
    return "Esta es una demo y no realiza cobros. En producción se puede agregar el medio de pago que defina el negocio, después de confirmar compatibilidad, instalación y despacho.";
  }

  return "Puedo responder preguntas sobre servicios, cotizaciones, compatibilidad, instalación previa coordinación, despacho o contacto. Prueba una de las opciones rápidas.";
}

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const ask = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text: trimmed },
      { id: Date.now() + 1, role: "assistant", text: answerFor(trimmed) },
    ]);
    setInput("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <>
      {open && (
        <section className="support-chat" role="dialog" aria-modal="false" aria-label="Asistente de DRG Automotriz">
          <header className="support-chat__header">
            <div className="support-chat__identity">
              <span className="support-chat__avatar">DRG</span>
              <div><strong>Asistente DRG</strong><small>Respuestas sobre tu instalación</small></div>
            </div>
            <button className="support-chat__close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar asistente">×</button>
          </header>
          <div className="support-chat__messages" aria-live="polite">
            {messages.map((message) => (
              <div className={`support-chat__message support-chat__message--${message.role}`} key={message.id}>
                {message.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="support-chat__quick" aria-label="Preguntas frecuentes">
            {quickQuestions.map((question) => <button type="button" key={question.label} onClick={() => ask(question.prompt)}>{question.label}</button>)}
          </div>
          <form className="support-chat__form" onSubmit={submit}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Escribe una pregunta" aria-label="Escribe una pregunta" />
            <button type="submit" aria-label="Enviar pregunta">→</button>
          </form>
          <p className="support-chat__note">Demo informativa · respuestas limitadas a servicios DRG</p>
        </section>
      )}
      <button className={`support-chat__launcher${open ? " is-open" : ""}`} type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? "Cerrar asistente DRG" : "Abrir asistente DRG"}>
        <span className="support-chat__launcher-icon" aria-hidden="true">{open ? "×" : "✦"}</span>
        <span>¿Tienes dudas?</span>
      </button>
    </>
  );
}
