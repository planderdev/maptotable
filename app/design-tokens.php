<?php
declare(strict_types=1);
// primitive → semantic → component. This file powers both the website and DS.
return [
    'primitive' => [
        'brand-orange' => '#F0823A', 'neutral-0' => '#FFFFFF', 'neutral-50' => '#F5F5F2',
        'neutral-100' => '#EAEAE5', 'neutral-200' => '#D5D5CE', 'neutral-500' => '#676961',
        'neutral-700' => '#42443D', 'neutral-900' => '#121212', 'neutral-950' => '#171914',
        'green-700' => '#376043', 'red-700' => '#A32924', 'amber-800' => '#76500D',
        'font-display' => '"Unbounded", sans-serif', 'font-sans' => '"Pretendard Variable", "Pretendard", sans-serif',
        'space-0' => '0px', 'space-1' => '8px', 'space-2' => '16px', 'space-3' => '24px', 'space-4' => '32px',
        'space-5' => '40px', 'space-6' => '48px', 'space-8' => '64px', 'space-10' => '80px', 'space-12' => '96px',
        'space-16' => '128px', 'space-20' => '160px', 'radius-1' => '16px', 'radius-2' => '24px',
    ],
    'semantic' => [
        'surface-page' => 'var(--neutral-50)', 'surface-section' => 'var(--neutral-100)',
        'surface-elevated' => 'var(--neutral-0)', 'surface-inverse' => 'var(--neutral-900)', 'surface-brand' => 'var(--brand-orange)',
        'text-primary' => 'var(--neutral-900)', 'text-secondary' => 'var(--neutral-500)', 'text-inverse' => 'var(--neutral-50)', 'text-on-brand' => 'var(--neutral-950)',
        'border-default' => 'var(--neutral-200)', 'border-strong' => 'var(--neutral-500)', 'border-focus' => 'var(--neutral-900)',
        'action-primary' => 'var(--brand-orange)', 'action-secondary' => 'var(--neutral-900)', 'action-disabled' => 'var(--neutral-200)',
        'feedback-success' => 'var(--green-700)', 'feedback-error' => 'var(--red-700)', 'feedback-warning' => 'var(--amber-800)',
        'display-xl' => 'clamp(3.1rem, 9.4vw, 12rem)', 'display-xl-mobile' => '9.2vw', 'display-lg' => 'clamp(3rem, 6.2vw, 7rem)',
        'heading-lg' => 'clamp(2.25rem, 4.5vw, 5rem)', 'heading-md' => 'clamp(1.75rem, 2.5vw, 2.75rem)',
        'heading-sm' => 'clamp(1.25rem, 1.6vw, 1.75rem)', 'body-lg' => 'clamp(1.125rem, 1.35vw, 1.375rem)',
        'body-md' => '1rem', 'label-md' => '.9375rem', 'caption' => '.8125rem',
        'layout-gutter' => 'clamp(1rem, 4vw, 4rem)', 'layout-max' => '1792px', 'layout-reading' => '680px',
        'section-gap' => 'clamp(5rem, 9vw, 10rem)', 'header-height' => '80px',
        'motion-fast' => '160ms', 'motion-base' => '240ms', 'motion-reveal' => '560ms', 'motion-carousel' => '420ms',
        'ease-out' => 'cubic-bezier(.22, 1, .36, 1)', 'motion-distance' => '24px',
        'layer-header' => '30', 'layer-menu' => '40', 'layer-toast' => '50',
        'shadow-elevated' => '0 16px 48px rgb(32 34 29 / .08)',
    ],
    'component' => [
        'button-bg' => 'var(--action-primary)', 'button-text' => 'var(--text-on-brand)', 'button-radius' => 'var(--radius-1)', 'button-height' => '56px',
        'field-bg' => 'var(--surface-elevated)', 'field-border' => 'var(--border-strong)', 'field-radius' => 'var(--radius-1)',
        'story-card-radius' => 'var(--radius-2)', 'carousel-gap' => 'var(--space-3)', 'stepper-active' => 'var(--text-primary)',
        'navigation-bg' => 'var(--surface-elevated)',
    ],
];
