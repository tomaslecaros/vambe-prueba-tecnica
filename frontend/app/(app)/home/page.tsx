'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Brain,
  Zap,
  Target,
  ArrowRight,
  FileSpreadsheet,
  BarChart,
  BrainCircuit,
  Rocket,
  PlayCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: Upload,
      title: 'Uploads',
      description: 'Sube archivos Excel o CSV con tus clientes. El sistema procesa automáticamente, detecta duplicados y muestra el progreso en tiempo real.',
      href: '/uploads',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      features: [
        'Validación automática de formato',
        'Detección de duplicados',
        'Progreso en tiempo real',
        'Tabla completa de clientes',
      ],
    },
    {
      icon: BarChart3,
      title: 'Dashboard',
      description: 'Métricas y análisis completos de cierre de ventas. KPIs, gráficos por industria, vendedor, pain points y más.',
      href: '/dashboard',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      features: [
        'KPIs de conversión',
        'Gráficos interactivos',
        'Análisis por categorías',
        'Matrices de cierre',
      ],
    },
    {
      icon: TrendingUp,
      title: 'Predicción',
      description: 'Predicción de probabilidad de cierre usando Machine Learning. Ingresa una transcripción y obtén predicciones instantáneas.',
      href: '/prediction',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      features: [
        'Predicción con ML',
        'Análisis de transcripciones',
        'Factores clave identificados',
        'Modelo entrenado automáticamente',
      ],
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Prepara tu Archivo',
      icon: FileSpreadsheet,
      description: 'Necesitas un archivo Excel (.xlsx) o CSV con estas columnas:',
      columns: [
        'Nombre',
        'Correo Electronico',
        'Numero de Telefono',
        'Fecha de la Reunion',
        'Vendedor asignado',
        'closed (true/false)',
        'Transcripcion',
      ],
    },
    {
      number: 2,
      title: 'Sube y Procesa',
      icon: Upload,
      description: 'Ve a Uploads y sube tu archivo. El sistema:',
      items: [
        'Valida automáticamente el formato',
        'Detecta clientes duplicados (email + teléfono)',
        'Muestra el progreso en tiempo real',
        'Categoriza automáticamente con IA',
      ],
    },
    {
      number: 3,
      title: 'Analiza Resultados',
      icon: BarChart,
      description: 'Explora tus datos en Dashboard y Predicción:',
      items: [
        'Métricas de conversión y KPIs',
        'Gráficos por industria y vendedor',
        'Predicciones de cierre con ML',
        'Tabla completa de categorizaciones',
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12 border animate-fade-in">
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Bienvenido a Vambe
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Sistema Inteligente de Categorización y Predicción de Cierre
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1.5 text-sm">
              <Brain className="h-4 w-4 mr-2" />
              IA + Machine Learning
            </Badge>
            <Badge variant="secondary" className="px-3 py-1.5 text-sm">
              <Zap className="h-4 w-4 mr-2" />
              Procesamiento en Tiempo Real
            </Badge>
            <Badge variant="secondary" className="px-3 py-1.5 text-sm">
              <Target className="h-4 w-4 mr-2" />
              Predicción de Cierre
            </Badge>
          </div>

          <p className="text-muted-foreground max-w-2xl">
            Transforma tus transcripciones de reuniones de ventas en insights accionables.
            Categorización automática con LLM, análisis de conversión y predicción de
            probabilidad de cierre con Machine Learning.
          </p>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -z-0 animate-pulse delay-1000" />
      </div>

      {/* Quick Start Guide */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Rocket className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold">Guía Rápida</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 hover:-translate-y-1">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
                      <div className="relative bg-gradient-to-br from-primary to-primary/60 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
                        {step.number}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <step.icon className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>

                  {step.columns && (
                    <ul className="space-y-2 pl-2">
                      {step.columns.map((col, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-muted-foreground">{col}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {step.items && (
                    <ul className="space-y-2 pl-2">
                      {step.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Main Features */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Funcionalidades Principales</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="animate-fade-in hover:-translate-y-2 transition-all"
                style={{ animationDelay: `${index * 100}ms`, opacity: 0, animationFillMode: 'forwards' }}
              >
                <Card className={`p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 ${feature.bgColor}`}>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-10`}>
                        <Icon className={`h-8 w-8 ${feature.iconColor}`} />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Disponible
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                    </div>

                    <ul className="space-y-2 flex-1">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className={`h-1.5 w-1.5 rounded-full ${feature.iconColor.replace('text-', 'bg-')}`} />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <Button asChild className="w-full mt-4" variant="default">
                      <Link href={feature.href} className="flex items-center justify-center gap-2">
                        Explorar {feature.title}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <div
        className="rounded-2xl bg-gradient-to-r from-primary to-primary/60 p-8 text-white animate-fade-in"
        style={{ animationDelay: '300ms', opacity: 0, animationFillMode: 'forwards' }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">¿Listo para comenzar?</h3>
            <p className="text-white/80">
              Sube tu primer archivo y comienza a obtener insights valiosos de tus clientes
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="whitespace-nowrap">
            <Link href="/uploads" className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Ir a Uploads
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
