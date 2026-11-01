# PlantExpert Pro

Sistema experto para orientar el diagnóstico de enfermedades y problemas del cultivo de tomate (*Solanum lycopersicum*).

## Descripción

PlantExpert Pro es una aplicación web que utiliza un motor de reglas para analizar síntomas observados en tomateras y generar posibles diagnósticos.

Está orientada al cultivo de tomate al aire libre en la vertiente atlántica de Euskadi.

## Funcionalidades

- Cuestionario de síntomas con respuestas Sí, No y No lo sé.
- Diagnóstico mediante reglas.
- Identificación de varias causas posibles.
- Explicación de los síntomas y reglas aplicadas.
- Detección de información insuficiente.
- Detección de respuestas incompatibles.
- Casos de prueba para comprobar el funcionamiento.

## Problemas contemplados

- Alternariosis.
- Oídio.
- Mildiu tardío.
- Mancha bacteriana.
- Estrés por falta de agua.
- Exceso de agua.
- Deficiencias nutricionales.

## Componentes del sistema experto

1. **Interfaz de usuario:** recoge los síntomas mediante un cuestionario.
2. **Base de conocimiento:** contiene los hechos y las reglas agronómicas.
3. **Motor de inferencia:** aplica las reglas para obtener diagnósticos.
4. **Sistema de explicación:** muestra los síntomas y las reglas que justifican el resultado.
5. **Adquisición de conocimiento:** establece un procedimiento para añadir y validar nuevas reglas.

## Tecnologías

- React
- TypeScript
- Vite
- Tailwind CSS

## Pruebas

La aplicación incluye siete escenarios de prueba:

- Alternariosis.
- Oídio.
- Mildiu tardío.
- Información insuficiente.
- Caso sin regla compatible.
- Diagnóstico diferencial con varias causas.
- Respuestas incompatibles.

## Instalación

```bash
npm install
npm run dev
```

## Limitaciones

PlantExpert Pro es una herramienta de orientación. Sus resultados no sustituyen la evaluación de un técnico agrícola ni un diagnóstico de laboratorio.
