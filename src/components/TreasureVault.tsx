import React from "react";
import { Reward, ChildProfile, RewardClaim } from "../types";
import { Compass, IceCream, Film, Moon, Dices, Coins, Gift, Sparkles, CheckCheck, Clock, ShieldAlert } from "lucide-react";

interface TreasureVaultProps {
  rewards: Reward[];
  activeChild: ChildProfile;
  claims: RewardClaim[];
  onClaimReward: (rewardId: string) => void;
  accessibilityOn: boolean;
}

export const TreasureVault: React.FC<TreasureVaultProps> = ({
  rewards,
  activeChild,
  claims,
  onClaimReward,
  accessibilityOn
}) => {
  // Helper to map reward string to icon element with custom cozy styling
  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case "Compass":
        return <Compass className="w-5 h-5 text-indigo-500" />;
      case "IceCream":
        return <IceCream className="w-5 h-5 text-pink-500" />;
      case "Film":
        return <Film className="w-5 h-5 text-sky-500" />;
      case "Moon":
        return <Moon className="w-5 h-5 text-purple-500" />;
      case "Dices":
        return <Dices className="w-5 h-5 text-amber-500" />;
      default:
        return <Gift className="w-5 h-5 text-stone-500" />;
    }
  };

  // Helper to get custom pastel card background based on reward icon to create a rainbow pastel dashboard
  const getPastelCardStyles = (iconName: string) => {
    switch (iconName) {
      case "Compass":
        return "bg-indigo-50/70 border-indigo-200";
      case "IceCream":
        return "bg-pink-50/70 border-pink-200";
      case "Film":
        return "bg-sky-50/70 border-sky-200";
      case "Moon":
        return "bg-purple-50/70 border-purple-150";
      case "Dices":
        return "bg-amber-50/70 border-amber-200";
      default:
        return "bg-stone-50/70 border-stone-200";
    }
  };

  // Filter claims for active child to show status log
  const childClaims = claims.filter(c => c.childId === activeChild.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="treasure-vault-section">
      {/* Rewards Catalog Left/Center Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between bg-white p-5 border border-stone-200 rounded-3xl shadow-sm">
          <div>
            <h2 className="font-display font-bold text-stone-850 text-lg tracking-tight flex items-center gap-1.5">
              <Gift className="w-5 h-5 text-purple-500" />
              Family Reward Store
            </h2>
            <p className="text-stone-500 text-xs mt-0.5">Spend your hard-earned stars to enjoy wonderful rewards together!</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-xs">
            <span className="text-lg">⭐</span>
            <span className="text-amber-850 font-display font-bold text-xs">{activeChild.points} Stars</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="rewards-list-deck">
          {rewards.map((reward) => {
            const isAffordable = activeChild.points >= reward.cost;
            const cardStyle = getPastelCardStyles(reward.icon);
            return (
              <div
                key={reward.id}
                id={`reward-item-${reward.id}`}
                className={`border rounded-3xl p-5 hover:shadow-md transition flex flex-col justify-between ${cardStyle} bg-white shadow-sm duration-300`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 bg-white p-2 border border-stone-150 rounded-2xl w-fit shadow-xs">
                    {getRewardIcon(reward.icon)}
                  </div>
                  <h3 className={`font-display font-bold text-stone-850 ${accessibilityOn ? 'text-lg md:text-xl' : 'text-sm md:text-base'}`}>
                    {reward.title}
                  </h3>
                  <p className="text-stone-600 text-xs leading-normal mt-1.5 font-sans">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-stone-200/40 pt-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-900 font-display font-bold text-xs bg-white px-2.5 py-1 rounded-xl border border-amber-200 shadow-xs">
                      ⭐ {reward.cost} Stars
                    </span>
                  </div>

                  <button
                    id={`btn-redeem-${reward.id}`}
                    disabled={!isAffordable}
                    onClick={() => onClaimReward(reward.id)}
                    className={`px-4 py-2 rounded-2xl font-display font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      isAffordable
                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 active:scale-95 text-white shadow-xs"
                        : "bg-stone-100 border border-stone-200 text-stone-400 cursor-not-allowed"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isAffordable ? "Trade Stars" : "Keep Earning!"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History & Claim Queue Right Sidebar */}
      <div className="space-y-6">
        <div className="bg-white border border-stone-200/80 rounded-3xl p-5 shadow-sm">
          <h3 className="text-stone-850 font-display font-bold text-sm uppercase tracking-wider mb-4 border-b border-stone-150 pb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            Claimed treats ({childClaims.length})
          </h3>

          <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1" id="history-scroller">
            {childClaims.length === 0 ? (
              <div className="py-8 text-center bg-stone-50 rounded-2xl border border-stone-200">
                <Gift className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-500 text-xs font-semibold">No rewards spent yet.</p>
                <p className="text-stone-400 text-[10px] mt-0.5">Complete chores to spend Stars here!</p>
              </div>
            ) : (
              childClaims.map((claim) => {
                const rewardDetails = rewards.find(r => r.id === claim.rewardId);
                const isPending = claim.status === "pending";
                return (
                  <div
                    key={claim.id}
                    className={`p-3 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                      isPending
                        ? "bg-amber-50/50 border-amber-200"
                        : "bg-emerald-50/55 border-emerald-250"
                    }`}
                  >
                    <div className="space-y-0.5 text-left">
                      <p className="font-display font-bold text-stone-800 text-xs">
                        {rewardDetails ? rewardDetails.title : "Mystery Surprise Treat"}
                      </p>
                      <p className="text-[10px] text-stone-500">
                        {claim.claimedAt.split("T")[0]} {claim.claimedAt.split("T")[1]?.slice(0, 5) || ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-0.5">
                      {isPending ? (
                        <span className="text-amber-800 font-display font-medium text-[9px] uppercase px-2 py-0.5 bg-white rounded-xl flex items-center gap-1 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                          Pending Check
                        </span>
                      ) : (
                        <span className="text-emerald-800 font-display font-semibold text-[9px] uppercase px-2 py-0.5 bg-white rounded-xl flex items-center gap-1 border border-emerald-200">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                          Ready!
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
