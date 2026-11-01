/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';

import { Header } from './components/Header';
import { HeroBotanica } from './components/HeroBotanica';
import { Questionnaire } from './components/Questionnaire';
import { DiagnosisResult } from './components/DiagnosisResult';
import { ManualTestsBar } from './components/ManualTestsBar';
import { InfoModal } from './components/InfoModal';

import {
  RespuestaValor,
  HumedadSueloValor,
  DiagnosticarRequest,
  DiagnosticarResponse,
  CasoPruebaManual,
} from './types/plantexpert';

import { diagnosticarLocal } from './services/localInference';
import { PREGUNTAS_SINTOMAS } from './config/symptomsData';

export default function App() {
  const [respuestas, setRespuestas] = useState<
    Record<string, RespuestaValor>
  >({});

  const [humedadSuelo, setHumedadSuelo] =
    useState<HumedadSueloValor>('');

  const [vistaActiva, setVistaActiva] =
    useState<'cuestionario' | 'resultado'>('cuestionario');

  const [activeTab, setActiveTab] =
    useState<'cuestionario' | 'pruebas' | 'info'>('cuestionario');

  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [resultado, setResultado] =
    useState<DiagnosticarResponse | null>(null);

  const [payloadEnviado, setPayloadEnviado] =
    useState<DiagnosticarRequest>({
      si: [],
      desconocidos: [],
      no_comprobados: [],
    });

  const [endpointConsultado, setEndpointConsultado] = useState('Motor de reglas local');
  const [errorMensaje, setErrorMensaje] = useState('');
  const [isConnectionError, setIsConnectionError] = useState(false);

  const questionnaireRef = useRef<HTMLDivElement>(null);

  // Control del botón Atrás del navegador.
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state?.vista === 'resultado') {
        setVistaActiva('resultado');
      } else {
        setVistaActiva('cuestionario');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Volver al cuestionario.
  const irACuestionario = () => {
    setVistaActiva('cuestionario');
    setActiveTab('cuestionario');

    try {
      if (window.history.state?.vista === 'resultado') {
        window.history.back();
      } else {
        window.history.replaceState(
          { vista: 'cuestionario' },
          '',
          '#cuestionario'
        );
      }
    } catch {
      // Ignorar restricciones del navegador.
    }

    window.setTimeout(() => {
      if (questionnaireRef.current) {
        questionnaireRef.current.scrollIntoView({
          behavior: 'smooth',
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  // Ejecutar las reglas directamente en la aplicación con el motor local.
  const ejecutarConsulta = async (payload: DiagnosticarRequest) => {
    setIsLoading(true);
    setPayloadEnviado(payload);
    setEndpointConsultado('Motor de reglas local');
    setErrorMensaje('');
    setIsConnectionError(false);

    try {
      const respuesta = diagnosticarLocal(payload);
      setResultado(respuesta);
    } catch {
      setResultado({
        estado: 'error_servicio',
        aviso: 'Se ha producido un error al evaluar las reglas con el motor local.',
      });
    }

    setIsLoading(false);
    setVistaActiva('resultado');

    try {
      window.history.pushState(
        { vista: 'resultado' },
        '',
        '#resultado'
      );
    } catch {
      // Ignorar restricciones del navegador.
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cargar un caso de prueba manual.
  const handleCargarCaso = (
    caso: CasoPruebaManual,
    autoEjecutar: boolean
  ) => {
    const nuevoMapa: Record<string, RespuestaValor> = {};

    for (const preg of PREGUNTAS_SINTOMAS) {
      nuevoMapa[preg.id] = caso.respuestas[preg.id] || 'no';
    }

    setRespuestas(nuevoMapa);
    setHumedadSuelo(caso.humedadSuelo);

    if (autoEjecutar) {
      const si: string[] = [];
      const desconocidos: string[] = [];
      const no_comprobados: string[] = [];

      for (const preg of PREGUNTAS_SINTOMAS) {
        const valor = nuevoMapa[preg.id];

        if (valor === 'si') {
          si.push(preg.id);
        } else if (valor === 'no_se') {
          desconocidos.push(preg.id);
        } else if (valor === 'sin_comprobar') {
          no_comprobados.push(preg.id);
        }
      }

      if (caso.id === 'test_incompatibilidad') {
        si.push('suelo_seco', 'suelo_encharcado');
      } else {
        if (caso.humedadSuelo === 'seca') {
          si.push('suelo_seco');
        } else if (caso.humedadSuelo === 'empapada') {
          si.push('suelo_encharcado');
        } else if (caso.humedadSuelo === 'no_lo_se') {
          desconocidos.push('suelo_humedad_desconocida');
        } else if (caso.humedadSuelo === '') {
          no_comprobados.push('suelo_humedad_desconocida');
        }
      }

      ejecutarConsulta({
        si,
        desconocidos,
        no_comprobados,
      });
    } else {
      irACuestionario();
    }
  };

  const handleReset = () => {
    setRespuestas({});
    setHumedadSuelo('');
    setResultado(null);
    setErrorMensaje('');
    setIsConnectionError(false);
    setVistaActiva('cuestionario');
    setActiveTab('cuestionario');

    try {
      window.history.replaceState(
        { vista: 'cuestionario' },
        '',
        '#cuestionario'
      );
    } catch {
      // Ignorar restricciones del navegador.
    }
  };

  const scrollToQuestionnaire = () => {
    irACuestionario();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F4] font-sans text-[#1D2B24]">
      <Header
        onOpenInfo={() => setInfoModalOpen(true)}
        onOpenTests={() => {
          setActiveTab('pruebas');
          irACuestionario();
        }}
        onVolverAlCuestionario={irACuestionario}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);

          if (tab === 'cuestionario') {
            irACuestionario();
          }
        }}
        vistaActiva={vistaActiva}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {vistaActiva === 'cuestionario' && (
          <HeroBotanica
            onIniciarCuestionario={scrollToQuestionnaire}
            onAbrirPruebas={() => {
              setActiveTab('pruebas');
            }}
            onAbrirInfo={() => setInfoModalOpen(true)}
          />
        )}

        {(activeTab === 'pruebas' ||
          vistaActiva === 'cuestionario') && (
          <ManualTestsBar
            onCargarCaso={handleCargarCaso}
            ejecutandoConsulta={isLoading}
          />
        )}

        <div ref={questionnaireRef}>
          {vistaActiva === 'cuestionario' ? (
            <Questionnaire
              respuestas={respuestas}
              setRespuestas={setRespuestas}
              humedadSuelo={humedadSuelo}
              setHumedadSuelo={setHumedadSuelo}
              onSubmit={(payload) => ejecutarConsulta(payload)}
              isLoading={isLoading}
              onReset={handleReset}
            />
          ) : (
            resultado && (
              <DiagnosisResult
                resultado={resultado}
                payloadEnviado={payloadEnviado}
                endpointConsultado={endpointConsultado}
                errorMensaje={errorMensaje}
                isConnectionError={isConnectionError}
                onVolverYCorregir={irACuestionario}
                onNuevaConsulta={handleReset}
                onReintentar={() =>
                  ejecutarConsulta(payloadEnviado)
                }
                isLoading={isLoading}
              />
            )
          )}
        </div>
      </main>

      <footer className="border-t border-[#52796F]/20 bg-white py-8 mt-16 text-xs text-[#52796F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-serif font-bold text-[#1D3B2F] text-sm">
              PlantExpert Pro · Plataforma de Diagnóstico Fitosanitario
            </p>

            <p className="text-[11px] text-[#5A736A]">
              Motor de reglas local para orientar sobre problemas del cultivo
              de tomate (Solanum lycopersicum).
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#2D5A46]">
            <button
              onClick={() => setInfoModalOpen(true)}
              className="hover:text-[#1D3B2F] underline cursor-pointer"
            >
              Dossier Técnico y Referencias
            </button>
          </div>
        </div>
      </footer>

      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
      />
    </div>
  );
}
