using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;
using Solana.Unity;
using Solana.Unity.Programs.Abstract;
using Solana.Unity.Programs.Utilities;
using Solana.Unity.Rpc;
using Solana.Unity.Rpc.Builders;
using Solana.Unity.Rpc.Core.Http;
using Solana.Unity.Rpc.Core.Sockets;
using Solana.Unity.Rpc.Types;
using Solana.Unity.Wallet;
using NebulaDrifter;
using NebulaDrifter.Program;
using NebulaDrifter.Errors;
using NebulaDrifter.Accounts;

namespace NebulaDrifter
{
    namespace Accounts
    {
        public partial class GameState
        {
            public static ulong ACCOUNT_DISCRIMINATOR => 8684738851132956304UL;
            public static ReadOnlySpan<byte> ACCOUNT_DISCRIMINATOR_BYTES => new byte[]{144, 94, 208, 172, 248, 99, 134, 120};
            public static string ACCOUNT_DISCRIMINATOR_B58 => "R9aG661U96X";
            public PublicKey Player { get; set; }

            public ushort Ore { get; set; }

            public ushort Crystal { get; set; }

            public ushort Platinum { get; set; }

            public byte UpgradeLevel { get; set; }

            public bool IsInitialized { get; set; }

            public static GameState Deserialize(ReadOnlySpan<byte> _data)
            {
                int offset = 0;
                ulong accountHashValue = _data.GetU64(offset);
                offset += 8;
                if (accountHashValue != ACCOUNT_DISCRIMINATOR)
                {
                    return null;
                }

                GameState result = new GameState();
                result.Player = _data.GetPubKey(offset);
                offset += 32;
                result.Ore = _data.GetU16(offset);
                offset += 2;
                result.Crystal = _data.GetU16(offset);
                offset += 2;
                result.Platinum = _data.GetU16(offset);
                offset += 2;
                result.UpgradeLevel = _data.GetU8(offset);
                offset += 1;
                result.IsInitialized = _data.GetBool(offset);
                offset += 1;
                return result;
            }
        }
    }

    namespace Errors
    {
        public enum NebulaDrifterErrorKind : uint
        {
            WrongPlayer = 6000U
        }
    }

    public partial class NebulaDrifterClient : TransactionalBaseClient<NebulaDrifterErrorKind>
    {
        public NebulaDrifterClient(IRpcClient rpcClient, IStreamingRpcClient streamingRpcClient, PublicKey programId) : base(rpcClient, streamingRpcClient, programId)
        {
        }

        public async Task<Solana.Unity.Programs.Models.ProgramAccountsResultWrapper<List<GameState>>> GetGameStatesAsync(string programAddress, Commitment commitment = Commitment.Finalized)
        {
            var list = new List<Solana.Unity.Rpc.Models.MemCmp>{new Solana.Unity.Rpc.Models.MemCmp{Bytes = GameState.ACCOUNT_DISCRIMINATOR_B58, Offset = 0}};
            var res = await RpcClient.GetProgramAccountsAsync(programAddress, commitment, memCmpList: list);
            if (!res.WasSuccessful || !(res.Result?.Count > 0))
                return new Solana.Unity.Programs.Models.ProgramAccountsResultWrapper<List<GameState>>(res);
            List<GameState> resultingAccounts = new List<GameState>(res.Result.Count);
            resultingAccounts.AddRange(res.Result.Select(result => GameState.Deserialize(Convert.FromBase64String(result.Account.Data[0]))));
            return new Solana.Unity.Programs.Models.ProgramAccountsResultWrapper<List<GameState>>(res, resultingAccounts);
        }

        public async Task<Solana.Unity.Programs.Models.AccountResultWrapper<GameState>> GetGameStateAsync(string accountAddress, Commitment commitment = Commitment.Finalized)
        {
            var res = await RpcClient.GetAccountInfoAsync(accountAddress, commitment);
            if (!res.WasSuccessful)
                return new Solana.Unity.Programs.Models.AccountResultWrapper<GameState>(res);
            var resultingAccount = GameState.Deserialize(Convert.FromBase64String(res.Result.Value.Data[0]));
            return new Solana.Unity.Programs.Models.AccountResultWrapper<GameState>(res, resultingAccount);
        }

        public async Task<SubscriptionState> SubscribeGameStateAsync(string accountAddress, Action<SubscriptionState, Solana.Unity.Rpc.Messages.ResponseValue<Solana.Unity.Rpc.Models.AccountInfo>, GameState> callback, Commitment commitment = Commitment.Finalized)
        {
            SubscriptionState res = await StreamingRpcClient.SubscribeAccountInfoAsync(accountAddress, (s, e) =>
            {
                GameState parsingResult = null;
                if (e.Value?.Data?.Count > 0)
                    parsingResult = GameState.Deserialize(Convert.FromBase64String(e.Value.Data[0]));
                callback(s, e, parsingResult);
            }, commitment);
            return res;
        }

        public async Task<RequestResult<string>> SendInitGameStateForPlayerAsync(InitGameStateForPlayerAccounts accounts, PublicKey feePayer, Func<byte[], PublicKey, byte[]> signingCallback, PublicKey programId)
        {
            Solana.Unity.Rpc.Models.TransactionInstruction instr = Program.NebulaDrifterProgram.InitGameStateForPlayer(accounts, programId);
            return await SignAndSendTransaction(instr, feePayer, signingCallback);
        }

        public async Task<RequestResult<string>> SendAddResourcesAsync(AddResourcesAccounts accounts, ushort ore, ushort crystal, ushort platinum, PublicKey feePayer, Func<byte[], PublicKey, byte[]> signingCallback, PublicKey programId)
        {
            Solana.Unity.Rpc.Models.TransactionInstruction instr = Program.NebulaDrifterProgram.AddResources(accounts, ore, crystal, platinum, programId);
            return await SignAndSendTransaction(instr, feePayer, signingCallback);
        }

        public async Task<RequestResult<string>> SendUpgradeAsync(UpgradeAccounts accounts, ushort ore, ushort crystal, ushort platinum, PublicKey feePayer, Func<byte[], PublicKey, byte[]> signingCallback, PublicKey programId)
        {
            Solana.Unity.Rpc.Models.TransactionInstruction instr = Program.NebulaDrifterProgram.Upgrade(accounts, ore, crystal, platinum, programId);
            return await SignAndSendTransaction(instr, feePayer, signingCallback);
        }

        public async Task<RequestResult<string>> SendResetAsync(ResetAccounts accounts, PublicKey feePayer, Func<byte[], PublicKey, byte[]> signingCallback, PublicKey programId)
        {
            Solana.Unity.Rpc.Models.TransactionInstruction instr = Program.NebulaDrifterProgram.Reset(accounts, programId);
            return await SignAndSendTransaction(instr, feePayer, signingCallback);
        }

        protected override Dictionary<uint, ProgramError<NebulaDrifterErrorKind>> BuildErrorsDictionary()
        {
            return new Dictionary<uint, ProgramError<NebulaDrifterErrorKind>>{{6000U, new ProgramError<NebulaDrifterErrorKind>(NebulaDrifterErrorKind.WrongPlayer, "Player and signer do not match")}, };
        }
    }

    namespace Program
    {
        public class InitGameStateForPlayerAccounts
        {
            public PublicKey Signer { get; set; }

            public PublicKey GameState { get; set; }

            public PublicKey SystemProgram { get; set; }
        }

        public class AddResourcesAccounts
        {
            public PublicKey Signer { get; set; }

            public PublicKey GameState { get; set; }
        }

        public class UpgradeAccounts
        {
            public PublicKey Signer { get; set; }

            public PublicKey GameState { get; set; }
        }

        public class ResetAccounts
        {
            public PublicKey Signer { get; set; }

            public PublicKey GameState { get; set; }
        }

        public static class NebulaDrifterProgram
        {
            public static Solana.Unity.Rpc.Models.TransactionInstruction InitGameStateForPlayer(InitGameStateForPlayerAccounts accounts, PublicKey programId)
            {
                List<Solana.Unity.Rpc.Models.AccountMeta> keys = new()
                {Solana.Unity.Rpc.Models.AccountMeta.Writable(accounts.Signer, true), Solana.Unity.Rpc.Models.AccountMeta.Writable(accounts.GameState, false), Solana.Unity.Rpc.Models.AccountMeta.ReadOnly(accounts.SystemProgram, false)};
                byte[] _data = new byte[1200];
                int offset = 0;
                _data.WriteU64(10510468131951664968UL, offset);
                offset += 8;
                byte[] resultData = new byte[offset];
                Array.Copy(_data, resultData, offset);
                return new Solana.Unity.Rpc.Models.TransactionInstruction{Keys = keys, ProgramId = programId.KeyBytes, Data = resultData};
            }

            public static Solana.Unity.Rpc.Models.TransactionInstruction AddResources(AddResourcesAccounts accounts, ushort ore, ushort crystal, ushort platinum, PublicKey programId)
            {
                List<Solana.Unity.Rpc.Models.AccountMeta> keys = new()
                {Solana.Unity.Rpc.Models.AccountMeta.Writable(accounts.Signer, true), Solana.Unity.Rpc.Models.AccountMeta.Writable(accounts.GameState, false)};
                byte[] _data = new byte[1200];
                int offset = 0;
                _data.WriteU64(4645879098642636920UL, offset);
                offset += 8;
                _data.WriteU16(ore, offset);
                offset += 2;
                _data.WriteU16(crystal, offset);
                offset += 2;
                _data.WriteU16(platinum, offset);
                offset += 2;
                byte[] resultData = new byte[offset];
                Array.Copy(_data, resultData, offset);
                return new Solana.Unity.Rpc.Models.TransactionInstruction{Keys = keys, ProgramId = programId.KeyBytes, Data = resultData};
            }

            public static Solana.Unity.Rpc.Models.TransactionInstruction Upgrade(UpgradeAccounts accounts, ushort ore, ushort crystal, ushort platinum, PublicKey programId)
            {
                List<Solana.Unity.Rpc.Models.AccountMeta> keys = new()
                {Solana.Unity.Rpc.Models.AccountMeta.Writable(accounts.Signer, true), Solana.Unity.Rpc.Models.AccountMeta.Writable(accounts.GameState, false)};
                byte[] _data = new byte[1200];
                int offset = 0;
                _data.WriteU64(1920037355368607471UL, offset);
                offset += 8;
                _data.WriteU16(ore, offset);
                offset += 2;
                _data.WriteU16(crystal, offset);
                offset += 2;
                _data.WriteU16(platinum, offset);
                offset += 2;
                byte[] resultData = new byte[offset];
                Array.Copy(_data, resultData, offset);
                return new Solana.Unity.Rpc.Models.TransactionInstruction{Keys = keys, ProgramId = programId.KeyBytes, Data = resultData};
            }

            public static Solana.Unity.Rpc.Models.TransactionInstruction Reset(ResetAccounts accounts, PublicKey programId)
            {
                List<Solana.Unity.Rpc.Models.AccountMeta> keys = new()
                {Solana.Unity.Rpc.Models.AccountMeta.Writable(accounts.Signer, true), Solana.Unity.Rpc.Models.AccountMeta.Writable(accounts.GameState, false)};
                byte[] _data = new byte[1200];
                int offset = 0;
                _data.WriteU64(15488080923286262039UL, offset);
                offset += 8;
                byte[] resultData = new byte[offset];
                Array.Copy(_data, resultData, offset);
                return new Solana.Unity.Rpc.Models.TransactionInstruction{Keys = keys, ProgramId = programId.KeyBytes, Data = resultData};
            }
        }
    }
}