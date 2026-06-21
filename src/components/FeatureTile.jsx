export default function FeatureTile({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-[14px] bg-surface/80 border border-white-12 backdrop-blur-sm">
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-[15px] font-semibold text-white-80">{title}</h3>
        <p className="text-[13px] text-white-60 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
