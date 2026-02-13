import { Home, Users, Cloud, Cpu, Leaf, Zap } from 'lucide-react';
import greenhouseBlueprints from '@/assets/greenhouse-blueprints.png';

const features = [
  {
    icon: Home,
    title: 'Smart Greenhouse Structure',
    description: 'To tackle the increasing challenges of agricultural production',
    side: 'left' as const,
  },
  {
    icon: Cloud,
    title: 'Smart Farming and Frost Intelligent Control',
    description: 'Remote communication used for the monitoring and control of agro-climate croplands',
    side: 'left' as const,
  },
  {
    icon: Leaf,
    title: 'My Agricultural production is awesome',
    description: 'Agricultural production is either smaller or greater than the one planned',
    side: 'left' as const,
  },
  {
    icon: Users,
    title: 'Farm Management in controller',
    description: 'Farmers can choose to remotely control, either manually or automatically',
    side: 'right' as const,
  },
  {
    icon: Cpu,
    title: 'My internet of things systems and Resource data',
    description: 'Data is added in a wireless cloud system, and farmers can access it to analysis on your farm',
    side: 'right' as const,
  },
  {
    icon: Zap,
    title: 'Focus on Reduce Electric Energy Source',
    description: 'The Solar energy model is alternative for using electric power instead of normal electrical in Greenhouse',
    side: 'right' as const,
  },
];

export default function FeaturesSection() {
  const left = features.filter((f) => f.side === 'left');
  const right = features.filter((f) => f.side === 'right');

  return (
    <section className="premium-card mb-8 anim-in delay-2">
      <div className="text-center mb-8">
        <h2 className="text-lg font-bold mb-2">Smart Farm Features</h2>
        <p className="text-sm text-muted-foreground">Complete IoT-powered greenhouse management system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Left features */}
        <div className="flex flex-col gap-8">
          {left.map((f, i) => (
            <div key={i} className="text-center lg:text-right">
              <div className="flex justify-center lg:justify-end mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center icon-box-green">
                  <f.icon className="w-6 h-6 text-neon-green" />
                </div>
              </div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>

        {/* Center image */}
        <div className="flex justify-center">
          <img
            src={greenhouseBlueprints}
            alt="Greenhouse blueprint diagrams showing top, side, front and 3D views"
            className="max-w-full h-auto rounded-lg opacity-90"
          />
        </div>

        {/* Right features */}
        <div className="flex flex-col gap-8">
          {right.map((f, i) => (
            <div key={i} className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center icon-box-green">
                  <f.icon className="w-6 h-6 text-neon-green" />
                </div>
              </div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
