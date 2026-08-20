// src/app/[locale]/public/about/page.tsx
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import AboutContent from '../../../../components/about/AboutContent';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supported = ['ar','en','es','fr','kg','ln','nl','pt','sw'] as const;
  if (!supported.includes(locale as any)) notFound();

  const t = await getTranslations({ locale });

  return (
    <>
      <AboutContent
        title={t('about.title')}
        subtitle={t('about.subtitle')}
        origin_title={t('about.origin.title')}
        origin_content={t('about.origin.content')}
        context_title={t('about.context.title')}
        context_content={t('about.context.content')}
        problem_title={t('about.problem.title')}
        problem_content={t('about.problem.content')}
        transformation_title={t('about.transformation.title')}
        transformation_content={t('about.transformation.content')}
        solution_title={t('about.solution.title')}
        solution_content={t('about.solution.content')}
        offers_title={t('about.offers.title')}
        offers_content={t('about.offers.content')}
        vision_title={t('about.vision.title')}
        vision_content={t('about.vision.content')}
        value_title={t('about.value.title')}
        value_content={t('about.value.content')}
        perspective_title={t('about.perspective.title')}
        perspective_content={t('about.perspective.content')}
      />
    </>
  );
}
