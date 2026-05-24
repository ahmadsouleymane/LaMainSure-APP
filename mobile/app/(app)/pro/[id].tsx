import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../lib/theme';
import { fmtFcfa, type Pro, type Review } from '../../../lib/mock-data';
import { fetchProDetail, fetchProReviews } from '../../../lib/api';
import { AppHeader, Avatar, Badge, Button, Display, Icon, PortfolioTile, Rating, SectionTitle } from '../../../components/ui';

export default function ProDetail() {
  const router = useRouter();
  const { t } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pro, setPro] = useState<Pro | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchProDetail(id), fetchProReviews(id)])
      .then(([p, rv]) => { setPro(p); setReviews(rv); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !pro) {
    return (
      <View style={{ flex: 1, backgroundColor: t.paper }}>
        <AppHeader title="" onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {loading ? <ActivityIndicator color={t.ink} /> : <Text style={{ color: t.fg2 }}>Artisan introuvable.</Text>}
        </View>
      </View>
    );
  }

  const HeaderBlock = () => (
    <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 18, alignItems: 'center', gap: 10 }}>
      <Avatar name={pro.fullName} size={84} accent={pro.accent} image={pro.avatar} />
      <View style={{ alignItems: 'center' }}>
        <Display size={22}>{pro.name}</Display>
        <Text style={{ fontSize: 14, color: t.fg2, marginTop: 2, textAlign: 'center' }}>{pro.tags.join(' · ')} · {pro.neighborhood || pro.city}</Text>
      </View>
      <Rating value={pro.rating} count={pro.reviews} size={16} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {pro.verified && <Badge tone="success">Vérifié</Badge>}
        <Badge tone="neutral">{pro.yearsExperience} ans</Badge>
        <Badge tone="accent">Répond en {pro.responseTime}</Badge>
      </View>
    </View>
  );

  const BioBlock = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 14, color: t.fg2, lineHeight: 21 }}>{pro.bio}</Text>
    </View>
  );

  const ServicesBlock = () => (
    <>
      <SectionTitle title="Services & tarifs" />
      <View style={{ paddingHorizontal: 20, gap: 8 }}>
        {pro.services.map((s, i) => (
          <View key={i} style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: t.lineSoft, backgroundColor: t.paper }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: t.ink, flex: 1 }}>{s.title}</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: t.ink }}>{fmtFcfa(s.price)}</Text>
            </View>
            <Text style={{ fontSize: 13, color: t.fg2, marginTop: 4 }}>{s.desc}</Text>
            {s.durationMin ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                <Icon name="clock" size={12} color={t.fg3} />
                <Text style={{ fontSize: 12, color: t.fg3 }}>{s.durationMin} min</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </>
  );

  const AvailabilityBlock = () => (
    pro.availability.length === 0 ? null :
    <>
      <SectionTitle title="Prochaines disponibilités" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingBottom: 8 }}>
        {pro.availability.map((slot, i) => (
          <View key={i} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: t.line, backgroundColor: t.paper }}>
            <Text style={{ color: t.ink, fontSize: 13, fontWeight: '500' }}>{slot}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );

  const PortfolioBlock = ({ size = 'small' }: { size?: 'small' | 'big' }) => {
    const cols = size === 'big' ? 2 : 3;
    const count = size === 'big' ? 4 : 6;
    return (
      <>
        <SectionTitle title={`Portfolio · ${pro.portfolio} photos`} />
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
          {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={{ width: `${100 / cols}%`, padding: 3 }}>
              <PortfolioTile tag={pro.tags[0]} />
            </View>
          ))}
        </View>
      </>
    );
  };

  const ReviewsBlock = ({ count = 2 }: { count?: number }) => (
    <>
      <SectionTitle title={`Avis · ${pro.reviews}`} />
      <View style={{ paddingHorizontal: 20, gap: 12, paddingBottom: 24 }}>
        {reviews.length === 0 ? (
          <Text style={{ fontSize: 13, color: t.fg2 }}>Pas encore d'avis.</Text>
        ) : reviews.slice(0, count).map((r, i) => (
          <View key={r.id} style={{ paddingVertical: 12, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: t.lineSoft }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: t.ink }}>{r.clientName}</Text>
              <Text style={{ fontSize: 12, color: t.fg3 }}>{r.date}</Text>
            </View>
            <View style={{ marginTop: 4 }}><Rating value={r.rating} size={12} /></View>
            <Text style={{ fontSize: 14, color: t.ink, marginTop: 6, lineHeight: 21 }}>{r.text}</Text>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <AppHeader title="" onBack={() => router.back()} right={
        <Pressable hitSlop={8} onPress={() => Share.share({ message: `${pro.name} sur La Main Sûre — ${pro.tags.join(', ')}${pro.city ? ` · ${pro.city}` : ''}` })}><Icon name="share-2" size={22} color={t.ink} /></Pressable>
      } />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <HeaderBlock />
        <BioBlock />
        <ServicesBlock />
        <AvailabilityBlock />
        <PortfolioBlock size="small" />
        <ReviewsBlock count={2} />
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1, borderTopColor: t.lineSoft, backgroundColor: t.paper }}>
        <Pressable onPress={() => router.push(`/(app)/devis/${pro.id}`)} style={{
          width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: t.line,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="message-circle" size={20} color={t.ink} />
        </Pressable>
        <Button variant="outline" onPress={() => router.push(`/(app)/devis/${pro.id}`)} style={{ flex: 1 }}>Devis</Button>
        <Button onPress={() => router.push(`/(app)/booking/${pro.id}`)} style={{ flex: 1.4 }}>Réserver</Button>
      </View>
    </View>
  );
}
